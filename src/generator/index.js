import { fileURLToPath }         from 'node:url';

import fs                        from 'fs-extra';

import alias                     from '@rollup/plugin-alias';

import {
   importsExternal,
   importsResolve }              from '@typhonjs-build-test/rollup-plugin-pkg-imports';

import {
   commonPath,
   getFileList }                 from '@typhonjs-utils/file-util';

import {
   isIterable,
   isObject }                    from '@typhonjs-utils/object';

import { getPackageWithPath }    from '@typhonjs-utils/package-json';
import { init, parse }           from 'es-module-lexer';
import { resolve }               from 'import-meta-resolve';
import * as resolvePkg           from 'resolve.exports';
import { rollup }                from 'rollup';
import dts                       from 'rollup-plugin-dts';
import ts                        from 'typescript';
import upath                     from 'upath';

import * as internalPlugins      from './plugins.js';

import { Logger }                from '#logger';

import {
   validateCompilerOptions,
   validateConfig }              from './validation.js';

import { jsdocRemoveNodeByTags } from '../transformer/index.js';

import {
   addSyntheticExports,
   removePrivateStatic }         from '../transformer/internal/index.js';

/**
 * Invokes TS compiler in `checkJS` mode without processing DTS.
 *
 * @param {GenerateConfig | Iterable<GenerateConfig>} config - Generation configuration object.
 *
 * @returns {Promise<void>}
 */
async function checkDTS(config)
{
   if (isIterable(config))
   {
      for (const entry of config)
      {
         const processedConfigOrError = await processConfig(entry, s_DEFAULT_TS_CHECK_COMPILER_OPTIONS);

         if (typeof processedConfigOrError === 'string')
         {
            Logger.error(`checkDTS ${processedConfigOrError} Entry point '${entry.input}'`);
            continue;
         }

         Logger.info(`Checking DTS bundle for: ${entry.input}`, processedConfigOrError.config.logLevel);

         await checkDTSImpl(processedConfigOrError);
      }
   }
   else
   {
      const processedConfigOrError = await processConfig(config, s_DEFAULT_TS_CHECK_COMPILER_OPTIONS);

      if (typeof processedConfigOrError === 'string')
      {
         Logger.error(`checkDTS ${processedConfigOrError} Entry point '${config.input}'`);
         return;
      }

      Logger.info(`Checking DTS bundle for: ${config.input}`, processedConfigOrError.config.logLevel);

      await checkDTSImpl(processedConfigOrError);
   }
}

/**
 * `checkDTS` implementation.
 *
 * @param {ProcessedConfig}   pConfig - Processed Config.
 *
 * @returns {Promise<void>}
 */
async function checkDTSImpl(pConfig)
{
   compile(pConfig);
}

/**
 * Generates TS declarations from ESM source.
 *
 * @param {GenerateConfig | Iterable<GenerateConfig>} config - Generation configuration object.
 *
 * @returns {Promise<void>}
 */
async function generateDTS(config)
{
   if (isIterable(config))
   {
      for (const entry of config)
      {
         const processedConfigOrError = await processConfig(entry, s_DEFAULT_TS_GEN_COMPILER_OPTIONS);

         if (typeof processedConfigOrError === 'string')
         {
            Logger.error(`generateDTS ${processedConfigOrError} Entry point '${entry.input}'`);
            continue;
         }

         Logger.info(`Generating DTS bundle for: ${entry.input}`, processedConfigOrError.config.logLevel);

         await generateDTSImpl(processedConfigOrError);
      }
   }
   else
   {
      const processedConfigOrError = await processConfig(config, s_DEFAULT_TS_GEN_COMPILER_OPTIONS);

      if (typeof processedConfigOrError === 'string')
      {
         Logger.error(`generateDTS ${processedConfigOrError} Entry point '${config.input}'`);
         return;
      }

      Logger.info(`Generating DTS bundle for: ${config.input}`, processedConfigOrError.config.logLevel);

      await generateDTSImpl(processedConfigOrError);
   }
}

/**
 * `generateDTS` implementation.
 *
 * @param {ProcessedConfig}   pConfig - Processed Config.
 *
 * @returns {Promise<void>}
 */
async function generateDTSImpl(pConfig)
{
   const { compilerOptions } = pConfig;

   // Empty intermediate declaration output directory.
   if (fs.existsSync(compilerOptions.outDir)) { fs.emptyDirSync(compilerOptions.outDir); }

   // Log emit diagnostics as warnings.
   compile(pConfig, true);

   await bundleDTS(pConfig);
}

/**
 * Provides a Rollup plugin generating a bundled TS declaration after the bundle has been written.
 *
 * @type {(options?: GeneratePluginConfig) => import('rollup').Plugin}
 */
generateDTS.plugin = internalPlugins.generateDTSPlugin(generateDTS);

export { checkDTS, generateDTS };

// Internal Implementation -------------------------------------------------------------------------------------------

/**
 * @param {ProcessedConfig}   pConfig - Processed config.
 *
 * @returns {Promise<void>}
 */
async function bundleDTS(pConfig)
{
   const { config, compilerOptions, dtsMainPath, packages } = pConfig;

   const packageAlias = typeof config.bundlePackageExports === 'boolean' && config.bundlePackageExports ?
    resolvePackageExports(packages, config, compilerOptions.outDir) : [];

   let banner = '';

   if (isIterable(config.prependFiles))
   {
      const dir = upath.dirname(config.input);

      for (const prependFile of config.prependFiles)
      {
         const resolvedPath = upath.resolve(dir, prependFile);

         // First attempt to load the file relative to the entry point file.
         if (fs.existsSync(resolvedPath))
         {
            banner += fs.readFileSync(resolvedPath, 'utf-8');
            continue;
         }

         // Make a second attempt to load the file with the path provided.
         if (fs.existsSync(prependFile))
         {
            banner += fs.readFileSync(prependFile, 'utf-8');
            continue;
         }

         Logger.warn(`bundleDTS warning: could not prepend file; '${prependFile}'.`, config.logLevel);
      }
   }

   if (isIterable(config.prependString))
   {
      for (const prependStr of config.prependString) { banner += prependStr; }
   }

   const plugins = [];

   // Add `importsExternal` plugin if configured.
   if (config.importsExternal)
   {
      plugins.push(importsExternal(isObject(config.importsExternal) ? config.importsExternal : void 0));
   }

   // Add `importsResolve` plugin if configured.
   if (config.importsResolve)
   {
      plugins.push(importsResolve(isObject(config.importsResolve) ? config.importsResolve : void 0));
   }

   plugins.push(...[
      alias({ entries: packageAlias }),
      dts()
   ]);

   const rollupConfig = {
      input: {
         input: dtsMainPath,
         plugins
      },
      output: {
         banner,
         file: config.output,
         format: 'es',
      }
   };

   // Further config modification through optional GenerateConfig parameters -----------------------------------------

   if (config.rollupExternal !== void 0) { rollupConfig.input.rollupExternal = config.rollupExternal; }

   if (config.rollupOnwarn !== void 0) { rollupConfig.input.rollupOnwarn = config.rollupOnwarn; }

   if (config.rollupPaths !== void 0) { rollupConfig.output.rollupPaths = config.rollupPaths; }

   if (isObject(config.dtsReplace))
   {
      rollupConfig.input.plugins.push(internalPlugins.naiveReplace(config.dtsReplace));
   }

   // ----------------------------------------------------------------------------------------------------------------

   const bundle = await rollup(rollupConfig.input);
   await bundle.write(rollupConfig.output);
   await bundle.close();

   Logger.verbose(`Output bundled DTS file to: '${config.output}'`, config.logLevel);
}

/**
 * Compiles TS declaration files from the provided list of ESM & TS files.
 *
 * @param {ProcessedConfig}   pConfig - Processed config object.
 *
 * @param {boolean}  [warn=false] - Log the emit diagnostics as warnings for `generateDTS`.
 */
function compile(pConfig, warn = false)
{
   const { config, compilerOptions, filepaths, inputRelativeDir, tsFilepaths } = pConfig;

   const host = ts.createCompilerHost(compilerOptions, /* setParentNodes */ true);

   // Prepare and emit the d.ts files
   const program = ts.createProgram(filepaths, compilerOptions, host);

   let emitResult;

   /**
    * Prepend `removePrivateStatic` as the Typescript compiler changes private static members to become public
    * defined with a string pattern that can be detected.
    *
    * Prepend `jsdocRemoveNodeByTags` to remove internal tags if `filterTags` is defined.
    */
   const transformers = [
      ...(typeof config.removePrivateStatic === 'boolean' && config.removePrivateStatic ? [removePrivateStatic()] : []),
      ...(typeof config.filterTags === 'string' || isIterable(config.filterTags) ?
       [jsdocRemoveNodeByTags(config.filterTags)] : []),
      ...(tsFilepaths.length ? [addSyntheticExports(config.input, tsFilepaths)] : []),
      ...(isIterable(config.tsTransformers) ? config.tsTransformers : [])
   ];

   if (transformers.length)
   {
      emitResult = program.emit(void 0, void 0, void 0, void 0, {
         afterDeclarations: transformers,
      });
   }
   else
   {
      emitResult = program.emit();
   }

   const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

   // Default filter to exclude non-project files when option `tsDiagnosticExternal` is true and no explicit
   // `tsDiagnosticFilter` option is set.
   const filterExternalDiagnostic = (diagnostic) =>
   {
      if (diagnostic.file)
      {
         const fileName = upath.relative(process.cwd(), diagnostic.file.fileName);
         if (!fileName.startsWith(inputRelativeDir)) { return true; }
      }

      return false;
   };

   // Provide a default implementation to allow all diagnostic messages through.
   const filterDiagnostic = config.tsDiagnosticFilter ?? !config.tsDiagnosticExternal ? filterExternalDiagnostic :
    (() => false);

   for (const diagnostic of allDiagnostics)
   {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

      if (filterDiagnostic(diagnostic, message)) { continue; }

      // Special handling for `generateDTS` / log as warnings.
      if (warn)
      {
         // Only log if logLevel is `warn` or `all` and `tsDiagnosticLog` is true.
         if (!config.tsDiagnosticLog || Logger.logLevels[config.logLevel] > Logger.logLevels.warn) { continue; }

         if (diagnostic.file)
         {
            const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
            const fileName = upath.relative(process.cwd(), diagnostic.file.fileName);
            console.warn(`${fileName} (${line + 1},${character + 1})[33m: [TS] ${message}[0m`);
         }
         else
         {
            console.warn(`[33m[esm-d-ts] [TS] ${message}[0m`);
         }
      }
      else
      {
         if (diagnostic.file)
         {
            const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
            const fileName = upath.relative(process.cwd(), diagnostic.file.fileName);
            console.warn(`${fileName} (${line + 1},${character + 1}): [TS] ${message}`);
         }
         else
         {
            console.warn(`[esm-d-ts] [TS] ${message}`);
         }
      }
   }
}

/**
 * Fully parses all file paths provided. Includes top level "re-exported" packages in `packages` data.
 *
 * @param {GenerateConfig} config - Generate config.
 *
 * @returns {Promise<{files: Set<string>, packages: Set<string>}>} Parsed files and top level packages exported.
 */
async function parseFiles(config)
{
   await init;

   const { packageObj } = getPackageWithPath({ filepath: config.input });

   const filepaths = [config.input];

   const parsedFiles = new Set();

   const files = new Set();
   const packages = new Set();

   /**
    * Stores any unresolved imports from the closest `package.json` from `config.input`. The key is the import symbol
    * and value is the reason why it failed to resolve entirely.
    *
    * @type {Map<string, string>}
    */
   const unresolvedImports = new Map();

   const parsePaths = (fileList, topLevel = false) =>
   {
      const toParseFiles = new Set();

      for (const file of fileList)
      {
         let resolved = upath.isAbsolute(file) ? file : upath.resolve(file);

         // Must indicate warnings for the case when an `index.js` / `index.mjs` file is referenced by directory.
         const stats = fs.statSync(resolved);
         if (stats.isDirectory())
         {
            if (fs.existsSync(`${resolved}/index.js`) || fs.existsSync(`${resolved}/index.mjs`))
            {
               // Could not resolve index reference so skip file.
               Logger.warn(`parseFiles warning: detected bare directory import without expected '/index.(m)js'`,
                config.logLevel);
            }
            else
            {
               Logger.warn(`parseFiles warning: could not resolve directory; '${resolved}'`, config.logLevel);
            }

            continue;
         }

         if (parsedFiles.has(resolved)) { continue; }

         parsedFiles.add(resolved);

         const dirpath = upath.dirname(resolved);

         if (!fs.existsSync(resolved))
         {
            if (fs.existsSync(`${resolved}.js`)) { resolved = `${resolved}.js`; }
            else if (fs.existsSync(`${resolved}.mjs`)) { resolved = `${resolved}.mjs`; }
            else
            {
               Logger.warn(`parseFiles warning: could not resolve; '${resolved}'`, config.logLevel);
               continue;
            }
         }

         files.add(resolved);

         const fileData = fs.readFileSync(resolved, 'utf-8').toString();

         const [imports] = parse(fileData);

         for (const data of imports)
         {
            if (data.n === void 0 || data.d === -2) { continue; }

            // There is a local `imports` specifier so lookup and attempt to resolve via `resolve.exports` package.
            if (data.n.startsWith('#'))
            {
               let importpath;

               try
               {
                  const result = resolvePkg.imports(packageObj, data.n, config.conditionImports);

                  if (Array.isArray(result) && result.length)
                  {
                     // Examine the first result returned and process if it starts with `.` indicating a local file.
                     // `config.conditionImports` should be provided for a more specific lookup as necessary.
                     //
                     // Note: Local imports specifiers that resolve to packages are handled separately via
                     // `importsExternal` & `importsResolve` config options.
                     if (result[0]?.startsWith?.('.'))
                     {
                        const fullpath = upath.resolve(result[0]);
                        if (fs.existsSync(fullpath))
                        {
                           importpath = fullpath;
                        }
                        else
                        {
                           if (!unresolvedImports.has(data.n))
                           {
                              unresolvedImports.set(data.n,
                               `Imports specifier '${data.n}' in package imports did not resolve to an existing file: ${
                                result[0]}.`);
                           }
                        }
                     }
                  }
                  else
                  {
                     if (!unresolvedImports.has(data.n))
                     {
                        unresolvedImports.set(data.n, `Missing '${data.n}' specifier in package imports.`);
                     }
                  }
               }
               catch (err)
               {
                  // Unresolved import error
                  if (!unresolvedImports.has(data.n))
                  {
                     unresolvedImports.set(data.n, `Missing '${data.n}' specifier in package imports.`);
                  }
               }

               // Set actual value after `imports` lookup.
               if (importpath) { data.n = importpath; }
            }

            if (upath.isAbsolute(data.n))
            {
               toParseFiles.add(data.n);
               continue;
            }
            else if (data.n.startsWith('.'))
            {
               toParseFiles.add(upath.resolve(dirpath, data.n));
               continue;
            }

            const substring = fileData.substring(data.ss, data.se);

            // Only add packages exported from the top level as part of the public contract.
            if (topLevel && s_REGEX_EXPORT.exec(substring)) { packages.add(data.n); }
         }
      }

      if (toParseFiles.size > 0) { parsePaths(toParseFiles); }
   };

   parsePaths(filepaths, true);

   // Produce any warnings about unresolved imports specifiers.
   if (unresolvedImports.size > 0)
   {
      const keys = [...unresolvedImports.keys()].sort();
      for (const key of keys) { Logger.warn(unresolvedImports.get(key), config.logLevel); }
   }

   return { files, packages };
}

/**
 * Parses top level exported packages retrieving any associated Typescript declaration file for the package.
 *
 * @param {string}         packageName - NPM package name.
 *
 * @param {GenerateConfig} config - The generate configuration.
 *
 * @returns {string} Returns any found TS declaration for the given package.
 */
function parsePackage(packageName, config)
{
   const isOrgPackage = packageName.startsWith('@');

   // Split the package name into base and an export path. The last match index is either the package name or export
   // path.
   const match = isOrgPackage ? s_REGEX_PACKAGE_SCOPED.exec(packageName) : s_REGEX_PACKAGE.exec(packageName);

   if (!match) { return void 0; }

   let packagePath;
   let packageJSON;

   try
   {
      // Attempt to load explicit `./package.json` export.
      packagePath = fileURLToPath(resolve(`${match[1]}/package.json`, import.meta.url));

      packageJSON = JSON.parse(fs.readFileSync(packagePath, 'utf-8').toString());
   }
   catch (err)
   {
      try
      {
         // Attempt to load exact package name / path.
         const exportedPath = fileURLToPath(resolve(packageName, import.meta.url));

         const { packageObj, filepath } = getPackageWithPath({ filepath: exportedPath });

         packageJSON = packageObj;
         packagePath = filepath;
      }
      catch (err) { /**/ }
   }

   if (typeof packageJSON !== 'object')
   {
      Logger.warn(
       `parsePackage warning: Could not locate package.json for top level exported package; '${packageName}'`,
        config.logLevel);

      return void 0;
   }

   const packageDir = `./${upath.relative('.', upath.dirname(packagePath))}`;

   // Handle parsing package exports.
   if (typeof packageJSON.exports === 'object')
   {
      // The export path is the last match. This may not be defined which in this case '.' is used to match
      // the default export path.
      const exportPathMatch = match[match.length - 1];

      // If exportPathMatch is not defined use '.' instead of the path lookup.
      const exportPath = typeof exportPathMatch === 'string' ? `.${exportPathMatch}` : '.';

      const exportTypesPath = resolvePkg.exports(packageJSON, exportPath, { conditions: ['types'] });

      let resolvePath;

      if (exportTypesPath)
      {
         // Resolve any export path with `resolve.export`.
         // First attempt to resolve most recent Typescript support for `types` in exports.
         resolvePath = upath.join(packageDir, ...exportTypesPath);

         // If a declaration is found and the file exists return now.
         if (resolvePath.match(s_REGEX_DTS_EXTENSIONS) && fs.existsSync(resolvePath)) { return `./${resolvePath}`; }
      }

      const exportConditionPath = resolvePkg.exports(packageJSON, exportPath, config.conditionExports);

      if (exportConditionPath)
      {
         // Now resolve any provided export condition configuration option or default to `imports`.
         resolvePath = upath.join(packageDir, ...exportConditionPath);

         // In the chance case that the user provided export condition matches `types` check again for declaration file
         // before changing the extension and resolving further.
         const resolveDTS = resolvePath.match(s_REGEX_DTS_EXTENSIONS) ? `./${resolvePath}` :
          `./${upath.changeExt(resolvePath, '.d.ts')}`;

         // Found a TS declaration directly associated with the export then return it.
         if (fs.existsSync(resolveDTS)) { return resolveDTS; }
      }

      // Now attempt to find the nearest `package.json` that isn't the root `package.json`.
      const { packageObj, filepath } = getPackageWithPath({ filepath: resolvePath });

      // A specific subpackage export was specified, but no associated declaration found and the package.json found
      // is the root package, so a specific declaration for the subpackage is not resolved.
      if (upath.relative('.', filepath) === packagePath) { return void 0; }

      // Now check `package.json` `types` as last fallback.
      if (packageObj && typeof packageObj.types === 'string')
      {
         const lastResolveDTS = `./${upath.join(packageDir, packageObj.types)}`;
         if (lastResolveDTS.match(s_REGEX_DTS_EXTENSIONS) && fs.existsSync(lastResolveDTS)) { return lastResolveDTS; }
      }
   }

   // Now check `package.json` `types` as last fallback.
   if (typeof packageJSON.types === 'string')
   {
      const lastResolveDTS = `./${upath.join(packageDir, packageJSON.types)}`;
      if (lastResolveDTS.match(s_REGEX_DTS_EXTENSIONS) && fs.existsSync(lastResolveDTS)) { return lastResolveDTS; }
   }

   // The reason this is gated behind a config option is that typically a package without an `exports` / `types` field
   // in `package.json` is indicative of an older package that might not have compliant types.
   if (config.checkDefaultPath)
   {
      const lastResolveDTS = `./${packageDir}/index.d.ts`;
      if (fs.existsSync(lastResolveDTS)) { return lastResolveDTS; }
   }

   return void 0;
}

/**
 * Processes an original GenerateConfig object returning all processed data required to compile / bundle DTS.
 *
 * @param {GenerateConfig} origConfig - An original GenerateConfig.
 *
 * @param {import('type-fest').TsConfigJson.CompilerOptions} defaultCompilerOptions - Default compiler options.
 *
 * @returns {Promise<ProcessedConfig | string>} Processed config or error string.
 */
async function processConfig(origConfig, defaultCompilerOptions)
{
   // Initial sanity checks.
   if (!isObject(origConfig))
   {
      return `error: Aborting as 'config' must be an object.`;
   }

   if (origConfig?.compilerOptions !== void 0 && !isObject(origConfig.compilerOptions))
   {
      return `error: Aborting as 'config.compilerOptions' must be an object.`;
   }

   /**
    * A shallow copy of the original configuration w/ default values for , `filterTags`,`logLevel`,
    * `removePrivateStatic`, `tsDiagnosticExternal`, and `tsDiagnosticLog`.
    *
    * @type {GenerateConfig}
    */
   const config = Object.assign({
      filterTags: 'internal',
      logLevel: 'info',
      removePrivateStatic: true,
      tsDiagnosticExternal: false,
      tsDiagnosticLog: true
   }, origConfig);

   // Set default output extension and output file if not defined.
   if (config.outputExt === void 0) { config.outputExt = '.d.ts'; }

   // If not defined change extension of input to DTS extension and use as output.
   if (config.output === void 0) { config.output = upath.changeExt(config.input, config.outputExt); }

   if (!validateConfig(config))
   {
      return `error: Aborting as 'config' failed validation.`;
   }

   // Load default or configured `tsconfig.json` file to configure `compilerOptions`. --------------------------------

   let tsconfigPath;

   // Verify any tsconfig provided path.
   if (config.tsconfig)
   {
      if (fs.existsSync(config.tsconfig)) { tsconfigPath = config.tsconfig; }
      else { return `error: Aborting as 'tsconfig' path is specified, but file does not exist; '${config.tsconfig}'`; }
   }
   else
   {
      // Check for default `./tsconfig.json`
      if (fs.existsSync('./tsconfig.json')) { tsconfigPath = './tsconfig.json'; }
   }

   /** @type {import('type-fest').TsConfigJson.CompilerOptions} */
   let tsconfigCompilerOptions = {};

   if (tsconfigPath)
   {
      Logger.verbose(`Loading TS compiler options from 'tsconfig' path: ${tsconfigPath}`, config.logLevel);

      try
      {
         const configJSON = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8').toString());
         if (isObject(configJSON?.compilerOptions)) { tsconfigCompilerOptions = configJSON.compilerOptions; }
      }
      catch (err)
      {
         return `error: Aborting as 'tsconfig' path is specified, but failed to load; '${
          err.message}'\ntsconfig path: ${tsconfigPath};`;
      }
   }

   // ----------------------------------------------------------------------------------------------------------------

   /** @type {import('type-fest').TsConfigJson.CompilerOptions} */
   const compilerOptionsJson = Object.assign(defaultCompilerOptions, config.compilerOptions, tsconfigCompilerOptions);

   // Apply config override if available.
   if (typeof config.tsCheckJs === 'boolean') { compilerOptionsJson.checkJs = config.tsCheckJs; }

   // Validate compiler options with Typescript.
   const compilerOptions = validateCompilerOptions(compilerOptionsJson);

   // Return now if compiler options failed to validate.
   if (!compilerOptions)
   {
      return `error: Aborting as 'config.compilerOptions' failed validation.`;
   }

   // Unused as explicit file paths are passed to the TS compiler.
   delete compilerOptions.paths;

   // Parse project files --------------------------------------------------------------------------------------------

   // Resolve to full path.
   config.input = upath.resolve(config.input);

   // Get all files ending in `.ts` that are not declarations in the entry point folder or sub-folders. These TS files
   // will be compiled and added to the declaration bundle generated as synthetic wildcard exports.
   const tsFilepaths = await getFileList({
      dir: upath.dirname(config.input),
      includeFile: /^(?!.*\.d\.ts$).*\.ts$/,
      resolve: true
   });

   // Parse input source file and gather any top level NPM packages that may be referenced.
   const { files, packages } = await parseFiles(config);

   // Parsed input source files and any TS files found from input root.
   const filepaths = [...files, ...tsFilepaths];

   // Common path for all input source files linked to the entry point.
   const commonPathFiles = commonPath(...files);

   // Update options / configuration based on common parsed files path -----------------------------------------------

   // Adjust compilerOptions rootDir to common path of all source files detected.
   if (compilerOptions.rootDir === void 0)
   {
      compilerOptions.rootDir = commonPathFiles === '' && filepaths.length === 1 ? upath.dirname(filepaths[0]) :
       commonPathFiles;
   }

   // ---

   // Find the common base path for all parsed files and find the relative path to the input source file.
   const localRelativePath = commonPathFiles !== '' ? upath.relative(commonPathFiles, config.input) :
    upath.basename(config.input);

   // Get the input DTS entry point; append inputRelativePath after changing extensions to the compilerOptions outDir.
   const dtsMainPath = `${compilerOptions.outDir}/${upath.changeExt(localRelativePath, '.d.ts')}`;

   // ---

   // Relative path from current working directory to local common path. Used for filtering diagnostic errors.
   const inputRelativeDir = upath.relative(process.cwd(), commonPathFiles);

   // ----------------------------------------------------------------------------------------------------------------

   return { config, compilerOptions, dtsMainPath, filepaths, inputRelativeDir, packages, tsFilepaths };
}

/**
 * Attempt to resolve Typescript declarations for any packages and provide a correct alias for Rollup from the
 * outDir; default: `./.dts`. As of Typescript v5 it is necessary to copy the external NPM package types to the local
 * output directory.
 *
 * Note: This is useful for libraries that re-bundle NPM modules.
 *
 * @param {Set<string>} packages - List of top level exported packages.
 *
 * @param {GenerateConfig} config - The config object.
 *
 * @param {string}   outDir - The DTS output directory path.
 *
 * @returns {{}[]} Resolved local package types.
 */
function resolvePackageExports(packages, config, outDir)
{
   const packageAlias = [];

   for (const packageName of packages)
   {
      const resolveDTS = parsePackage(packageName, config);
      if (!resolveDTS)
      {
         Logger.warn(`resolvePackageExports warning: Could not locate TS declaration for package; '${packageName}'.`,
          config.logLevel);

         continue;
      }

      const dtsBasename = upath.basename(resolveDTS);

      const dtsFileData = fs.readFileSync(resolveDTS, 'utf-8');
      const outputDir = `${outDir}${upath.sep}._node_modules${upath.sep}${packageName}`;
      const outputFilepath = `${outputDir}${upath.sep}${dtsBasename}`;

      fs.ensureDirSync(outputDir);
      fs.writeFileSync(outputFilepath, dtsFileData, 'utf-8');

      packageAlias.push({
         find: packageName,
         replacement: outputFilepath
      });
   }

   return packageAlias;
}


/**
 * @type {import('type-fest').TsConfigJson.CompilerOptions}
 */
const s_DEFAULT_TS_GEN_COMPILER_OPTIONS = {
   allowJs: true,
   declaration: true,
   emitDeclarationOnly: true,
   moduleResolution: 'bundler',
   module: 'es2022',
   target: 'es2022',
   outDir: './.dts'
};

/**
 * @type {import('type-fest').TsConfigJson.CompilerOptions}
 */
const s_DEFAULT_TS_CHECK_COMPILER_OPTIONS = {
   allowJs: true,
   checkJs: true,
   declaration: true,
   noEmit: true,
   moduleResolution: 'bundler',
   module: 'es2022',
   target: 'es2022',
   outDir: './.dts'
};

const s_REGEX_DTS_EXTENSIONS = /\.d\.m?ts$/;
const s_REGEX_EXPORT = /^\s*export/;
const s_REGEX_PACKAGE = /^([a-z0-9-~][a-z0-9-._~]*)(\/[a-z0-9-._~/]*)*/;
const s_REGEX_PACKAGE_SCOPED = /^(@[a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-._~]*)(\/[a-z0-9-._~/]*)*/;

/**
 * @typedef {{ input: string } & GeneratePluginConfig} GenerateConfig Data used to generate the bundled TS declaration.
 */

/**
 * @typedef {object} GeneratePluginConfig Data used to generate the bundled TS declaration.
 *
 * @property {string}               [input] The input entry ESM source path.
 *
 * @property {boolean}              [bundlePackageExports=false] When true attempt to bundle types of top level
 * exported packages. This is useful for re-bundling libraries.
 *
 * @property {boolean}              [checkDefaultPath=false] When true and bundling top level package exports via
 * `bundlePackageExports` check for `index.d.ts` in package root; this is off by default as usually this is indicative
 * of and older package not updated for `exports` in `package.json`.
 *
 * @property {import('resolve.exports').Options}   [conditionExports] `resolve.exports` conditional options for
 * `package.json` exports field type.
 *
 * @property {import('resolve.exports').Options}   [conditionImports] `resolve.exports` conditional options for
 * `package.json` imports field type.
 *
 * @property {Record<string, string>} [dtsReplace] Options for naive text replacement operating on the final bundled
 * TS declaration file. The keys are converted into RegExp instances so may be a valid pattern to match.
 *
 * @property {string|Iterable<string>|false|null|undefined} [filterTags='internal'] By default,
 * `jsdocRemoveNodeByTags('internal')` transformer is automatically added removing all AST nodes that have the
 * `@internal` tag. To generate declarations with internal tags set to `false` / null / undefined.
 *
 * @property {boolean | import('@typhonjs-build-test/rollup-plugin-pkg-imports').ImportsPluginOptions} [importsExternal]
 * When defined enables `importsExternal` from the `@typhonjs-build-test/rollup-plugin-pkg-imports` package.
 *
 * @property {boolean | import('@typhonjs-build-test/rollup-plugin-pkg-imports').ImportsPluginOptions} [importsResolve]
 * When defined enables `importsResolve` from the `@typhonjs-build-test/rollup-plugin-pkg-imports` package.
 *
 * @property {'all' | 'verbose' | 'info' | 'warn' | 'error'} [logLevel='info'] Defines the logging level.
 *
 * @property {string}               [output] The output file path for the bundled TS declarations.
 *
 * @property {string}               [outputExt='.d.ts'] The bundled output TS declaration file extension. Normally a
 * complete `output` path is provided when using `generateDTS`, but this can be useful when using the Rollup plugin to
 * change the extension as desired.
 *
 * @property {Iterable<string>}     [prependFiles] Directly prepend these files to the bundled output. The files are
 * first attempted to be resolved relative to the entry point folder allowing a common configuration to be applied
 * across multiple subpath exports. Then a second attempt is made with the path provided.
 *
 * @property {Iterable<string>}     [prependString] Directly prepend these strings to the bundled output.
 *
 * @property {boolean}              [removePrivateStatic=true] When true a custom transformer is added to remove the
 * renaming of private static class members that Typescript currently renames.
 *
 *
 *
 * @property {import('type-fest').TsConfigJson.CompilerOptions}   [compilerOptions] Typescript compiler options.
 * {@link https://www.typescriptlang.org/tsconfig}
 *
 * @property {boolean}  [tsCheckJs=false] When true set `checkJs` to default compiler options. This is a
 * convenience parameter to quickly turn `checkJs` on / off.
 *
 * @property {string}   [tsconfig] Provide a path to a `tsconfig.json` for `compilerOptions` configuration.
 *
 * @property {boolean} [tsDiagnosticExternal=false] By default, all diagnostic errors that are external to the common
 * root path from the `input` source file will be filtered from diagnostic logging. Set to `true` to include all
 * diagnostic errors in logging. If you set an explicit diagnostic filter function via the `tsDiagnosticFilter` this
 * option is ignored.
 *
 * @property {(diagnostic: import('typescript').Diagnostic, message?: string) => boolean} [tsDiagnosticFilter] Optional
 * filter function to handle diagnostic messages in a similar manner as the `onwarn` Rollup callback. Return `true` to
 * filter the given diagnostic from posting to `console.error` otherwise return false to include.
 *
 * @property {boolean} [tsDiagnosticLog=true] When generating a DTS bundle you may opt to turn off any emitted TS
 * compiler diagnostic messages.
 *
 * @property {Iterable<ts.TransformerFactory<ts.Bundle | ts.SourceFile> | ts.CustomTransformerFactory>} [tsTransformers]
 * A list of TransformerFactory or CustomTransformerFactory functions to process generated declaration AST while
 * emitting intermediate types for bundling. {@link https://github.com/itsdouges/typescript-transformer-handbook}
 *
 *
 *
 * @property {(string | RegExp)[] | RegExp | string |
 * ((id: string, parentId: string, isResolved: boolean) => boolean)}  [rollupExternal] Rollup `external` option.
 * {@link https://rollupjs.org/configuration-options/#external}
 *
 * @property {Record<string, string> | ((id: string) => string)} [rollupPaths] Rollup `paths` option.
 * {@link https://rollupjs.org/configuration-options/#output-paths}
 *
 * @property {(warning: import('rollup').RollupWarning,
 * defaultHandler: (warning: string | import('rollup').RollupWarning) => void) => void} [rollupOnwarn] Rollup `onwarn`
 * option. {@link https://rollupjs.org/configuration-options/#onwarn}
 */

/**
 * @typedef {object} ProcessedConfig Contains the processed config and associated data.
 *
 * @property {ts.CompilerOptions} compilerOptions TS compiler options.
 *
 * @property {GenerateConfig} config Generate config w/ default data.
 *
 * @property {string}      dtsMainPath - The main output path for intermediate TS declarations generated.
 *
 * @property {string[]}    filepaths A list of all file paths to compile.
 *
 * @property {Set<string>} packages Top level packages exported from entry point.
 *
 * @property {string}      inputRelativeDir Relative directory of common project files path.
 *
 * @property {string[]}    tsFilepaths A list of all TS files to add synthetic exports.
 */
