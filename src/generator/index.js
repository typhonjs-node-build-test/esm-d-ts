/**
 * Provides the main entry points to the package including `checkDTS` and `generateDTS`.
 *
 * @module
 */

import { fileURLToPath }         from 'node:url';

import fs                        from 'fs-extra';

import alias                     from '@rollup/plugin-alias';

import {
   importsExternal,
   importsResolve }              from '@typhonjs-build-test/rollup-plugin-pkg-imports';

import {
   commonPath,
   getFileList,
   isDirectory,
   isFile }                      from '@typhonjs-utils/file-util';

import {
   isIterable,
   isObject }                    from '@typhonjs-utils/object';

import { getPackageWithPath }    from '@typhonjs-utils/package-json';
import { init, parse }           from 'es-module-lexer';
import { resolve }               from 'import-meta-resolve';
import * as prettier             from 'prettier';
import * as resolvePkg           from 'resolve.exports';
import { rollup }                from 'rollup';
import dts                       from 'rollup-plugin-dts';
import ts                        from 'typescript';
import upath                     from 'upath';

import { pluginManager }         from './pluginManager.js';
import * as internalPlugins      from './rollupPlugins.js';

import {
   regexJSExt,
   validateCompilerOptions,
   validateConfig }              from './validation.js';

import { PostProcess }           from '../postprocess/index.js';
import { outputGraph }           from '../postprocess/internal/outputGraph.js';

import { jsdocRemoveNodeByTags } from '../transformer/index.js';

import {
   addSyntheticExports,
   jsdocImplementsDynamicImport,
   jsdocPreserveModuleTag,
   jsdocSetterParamName,
   removePrivateStatic }         from '../transformer/internal/index.js';

import { logger }                from '#util';

const eventbus = pluginManager.getEventbus();

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
            logger.error(`checkDTS ${processedConfigOrError} Entry point '${entry.input}'`);
            continue;
         }

         logger.info(`Checking DTS bundle for: ${entry.input}`);

         await checkDTSImpl(processedConfigOrError);
      }
   }
   else
   {
      const processedConfigOrError = await processConfig(config, s_DEFAULT_TS_CHECK_COMPILER_OPTIONS);

      if (typeof processedConfigOrError === 'string')
      {
         logger.error(`checkDTS ${processedConfigOrError} Entry point '${config.input}'`);
         return;
      }

      logger.info(`Checking DTS bundle for: ${config.input}`);

      await checkDTSImpl(processedConfigOrError);
   }
}

/**
 * `checkDTS` implementation.
 *
 * @param {ProcessedConfig}   processedConfig - Processed Config.
 *
 * @returns {Promise<void>}
 */
async function checkDTSImpl(processedConfig)
{
   await eventbus.triggerAsync('lifecycle:start', { processedConfig });

   await compile(processedConfig);

   await eventbus.triggerAsync('lifecycle:end', { processedConfig });
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
            logger.error(`generateDTS ${processedConfigOrError} Entry point '${entry.input}'`);
            continue;
         }

         logger.info(`Generating DTS bundle for: ${entry.input}`);

         await generateDTSImpl(processedConfigOrError);
      }
   }
   else
   {
      const processedConfigOrError = await processConfig(config, s_DEFAULT_TS_GEN_COMPILER_OPTIONS);

      if (typeof processedConfigOrError === 'string')
      {
         logger.error(`generateDTS ${processedConfigOrError} Entry point '${config.input}'`);
         return;
      }

      logger.info(`Generating DTS bundle for: ${config.input}`);

      await generateDTSImpl(processedConfigOrError);
   }
}

/**
 * `generateDTS` implementation.
 *
 * @param {ProcessedConfig}   processedConfig - Processed Config.
 *
 * @returns {Promise<void>}
 */
async function generateDTSImpl(processedConfig)
{
   await eventbus.triggerAsync('lifecycle:start', { processedConfig });

   const { dtsDirectoryPath, generateConfig } = processedConfig;

   // Empty intermediate declaration output directory.
   if (isDirectory(dtsDirectoryPath)) { fs.emptyDirSync(dtsDirectoryPath); }

   // Log emit diagnostics as warnings.
   const jsdocModuleComments = await compile(processedConfig, true);

   await bundleDTS(processedConfig, jsdocModuleComments);

   // Run prettier on the bundled output file.
   const text = fs.readFileSync(generateConfig.output, 'utf-8');
   const formatted = await prettier.format(text, { parser: 'typescript', printWidth: 120, singleQuote: true });
   fs.writeFileSync(generateConfig.output, formatted);

   await eventbus.triggerAsync('lifecycle:end', { processedConfig });
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
 * @param {ProcessedConfig}   processedConfig - Processed config.
 *
 * @param {{ comment: string, filepath: string}[]} [jsdocModuleComments] - Any comments with the `@module` tag.
 *
 * @returns {Promise<void>}
 */
async function bundleDTS(processedConfig, jsdocModuleComments = [])
{
   const { compilerOptions, dtsEntryPath, generateConfig, packages } = processedConfig;

   const packageAlias = typeof generateConfig.bundlePackageExports === 'boolean' &&
    generateConfig.bundlePackageExports ? resolvePackageExports(packages, generateConfig, compilerOptions.outDir) : [];

   if (jsdocModuleComments.length > 1)
   {
      const jsdocPaths = jsdocModuleComments.map((entry) => entry?.filepath).join('\n');

      logger.warn(
       `bundleDTS warning: multiple JSDoc comments detected with the '@module' / '@packageDocumentation' tag from:\n${
        jsdocPaths}`);
   }

   // Prepend any comment with the `@module` tag preserving it in the bundled DTS file.

   let banner = jsdocModuleComments.length === 1 && typeof jsdocModuleComments[0]?.comment === 'string' ?
    `${jsdocModuleComments[0].comment}\n` : '';

   if (isIterable(generateConfig.prependFiles))
   {
      const dir = upath.dirname(generateConfig.input);

      for (const prependFile of generateConfig.prependFiles)
      {
         const resolvedPath = upath.resolve(dir, prependFile);

         // First attempt to load the file relative to the entry point file.
         if (isFile(resolvedPath))
         {
            banner += fs.readFileSync(resolvedPath, 'utf-8');
            continue;
         }

         // Make a second attempt to load the file with the path provided.
         if (isFile(prependFile))
         {
            banner += fs.readFileSync(prependFile, 'utf-8');
            continue;
         }

         logger.warn(`bundleDTS warning: could not prepend file; '${prependFile}'.`);
      }
   }

   if (isIterable(generateConfig.prependString))
   {
      for (const prependStr of generateConfig.prependString) { banner += prependStr; }
   }

   const plugins = [];

   // Add `importsExternal` plugin if configured.
   if (generateConfig.importsExternal)
   {
      plugins.push(importsExternal(isObject(generateConfig.importsExternal) ? generateConfig.importsExternal : void 0));
   }

   // Add `importsResolve` plugin if configured.
   if (generateConfig.importsResolve)
   {
      plugins.push(importsResolve(isObject(generateConfig.importsResolve) ? generateConfig.importsResolve : void 0));
   }

   plugins.push(...[
      alias({ entries: packageAlias }),
      dts()
   ]);

   const rollupConfig = {
      input: {
         input: dtsEntryPath,
         plugins
      },
      output: {
         banner,
         file: generateConfig.output,
         format: 'es',
      }
   };

   // Further config modification through optional GenerateConfig parameters -----------------------------------------

   if (generateConfig.rollupExternal !== void 0) { rollupConfig.input.external = generateConfig.rollupExternal; }

   if (generateConfig.rollupOnwarn !== void 0) { rollupConfig.input.onwarn = generateConfig.rollupOnwarn; }

   if (generateConfig.rollupPaths !== void 0) { rollupConfig.output.paths = generateConfig.rollupPaths; }

   if (isObject(generateConfig.dtsReplace))
   {
      rollupConfig.input.plugins.push(internalPlugins.naiveReplace(generateConfig.dtsReplace));
   }

   // ----------------------------------------------------------------------------------------------------------------

   const bundle = await rollup(rollupConfig.input);
   await bundle.write(rollupConfig.output);
   await bundle.close();

   // Collect the postprocessor functions.
   // Add the internal `outputGraph` post processor if `config.outputGraph` is defined.
   const processors = typeof generateConfig.outputGraph === 'string' ? [
      ...(isIterable(generateConfig.postprocess) ? generateConfig.postprocess : []),
      outputGraph(generateConfig.outputGraph, generateConfig.outputGraphIndentation)
   ] : [...(isIterable(generateConfig.postprocess) ? generateConfig.postprocess : [])];

   // Handle any postprocessing of the bundled declarations.
   if (processors.length)
   {
      PostProcess.process({
         filepath: generateConfig.output,
         output: generateConfig.outputPostprocess,
         processors
      });
   }

   logger.verbose(`Output bundled DTS file to: '${generateConfig.output}'`);
}

/**
 * Compiles TS declaration files from the provided list of ESM & TS files.
 *
 * @param {ProcessedConfig}   processedConfig - Processed config object.
 *
 * @param {boolean}  [warn=false] - Log the emit diagnostics as warnings for `generateDTS`.
 *
 * @returns {Promise<{ comment: string, filepath: string }[]>} Any parsed JSDoc comments with the `@module` tag.
 */
async function compile(processedConfig, warn = false)
{
   const {
      compilerOptions,
      compileFilepaths,
      dtsEntryPath,
      generateConfig,
      inputRelativeDir,
      tsFilepaths
   } = processedConfig;

   const host = ts.createCompilerHost(compilerOptions, /* setParentNodes */ true);

   /**
    * Stores any in-memory transformed file data from plugin processing. The key is the file name and value is
    * transformed code.
    *
    * @type {Map<string, string>}
    */
   const memoryFiles = new Map();

   // Allow any plugins to handle non-JS files potentially modifying `compileFilepaths` and adding transformed code to
   // `memoryFiles`.
   await eventbus.triggerAsync('compile:transform', { logger, memoryFiles, processedConfig });

   // Replace default CompilerHost `readFile` to be able to load transformed file data in memory.
   const origReadFile = host.readFile;
   host.readFile = (fileName) =>
   {
      if (memoryFiles.has(fileName)) { return memoryFiles.get(fileName); }

      return origReadFile(fileName);
   };

   // Prepare and emit the d.ts files
   const program = ts.createProgram(compileFilepaths, compilerOptions, host);

   let emitResult;

   const jsdocModuleComments = [];

   /**
    * Add `jsdocPreserveModuleTag` to store any `@module` / `@packageDescription` tags to prepend to output DTS.
    *
    * Add `jsdocSetterParamName` to correct TS compiler renaming of setter param name.
    *
    * Optionally add `removePrivateStatic` as the Typescript compiler changes private static members to become public
    * defined with a string pattern that can be detected.
    *
    * Optionally add `jsdocRemoveNodeByTags` to remove internal tags if `filterTags` is defined.
    *
    * Optionally add `addSyntheticExports` to add exports for any additional TS files compiled.
    *
    * Optionally add any user defined transformers.
    */
   const transformers = [
      jsdocPreserveModuleTag(jsdocModuleComments, generateConfig.input),

      jsdocImplementsDynamicImport(),

      jsdocSetterParamName(),

      ...(typeof generateConfig.removePrivateStatic === 'boolean' && generateConfig.removePrivateStatic ?
       [removePrivateStatic()] : []),

      ...(typeof generateConfig.filterTags === 'string' || isIterable(generateConfig.filterTags) ?
       [jsdocRemoveNodeByTags(generateConfig.filterTags)] : []),

      ...(tsFilepaths.length ? [addSyntheticExports(generateConfig.input, tsFilepaths)] : []),

      ...(isIterable(generateConfig.tsTransformers) ? generateConfig.tsTransformers : [])
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
   const filterDiagnostic = generateConfig.tsDiagnosticFilter ?? !generateConfig.tsDiagnosticExternal ?
    filterExternalDiagnostic : (() => false);

   for (const diagnostic of allDiagnostics)
   {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

      if (filterDiagnostic(diagnostic, message)) { continue; }

      // Special handling for `generateDTS` / log as warnings.
      if (warn)
      {
         // Only log if logLevel is not `error` or `tsDiagnosticLog` is true.
         if (!generateConfig.tsDiagnosticLog || !logger.is.warn) { continue; }

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

   // Find the output main path. This will be `.d.ts` for initial source files with `.js` extension.
   let dtsEntryPathActual = upath.changeExt(dtsEntryPath, '.d.ts');

   // If that doesn't exist check for `.mts` which is generated for `.mjs` files.
   if (!isFile(dtsEntryPathActual)) { dtsEntryPathActual = upath.changeExt(dtsEntryPath, '.d.mts'); }

   if (!isFile(dtsEntryPathActual))
   {
      logger.error(`compile error: could not locate DTS entry point file in './dts' output.'`);
      process.exit(1);
   }

   // Update processed config for the actual DTS entry path after compilation.
   processedConfig.dtsEntryPath = dtsEntryPathActual;

   // Allow any plugins to handle postprocessing of generated DTS files.
   await eventbus.triggerAsync('compile:end', { logger, memoryFiles, PostProcess, processedConfig });

   return jsdocModuleComments;
}

/**
 * Lexically parses all files connected to the entry point. Additional data includes top level "re-exported" packages
 * in `packages` data.
 *
 * @param {GenerateConfig} generateConfig - Generate config.
 *
 * @returns {Promise<{lexerFilepaths: string[], packages: string[]}>} Lexically parsed files and top level
 *          packages exported.
 */
async function parseFiles(generateConfig)
{
   await init;

   const { packageObj } = getPackageWithPath({ filepath: generateConfig.input });

   const entrypoint = [generateConfig.input];

   const parsedFiles = new Set();

   const lexerFilepaths = new Set();
   const packages = new Set();

   /**
    * Stores any unresolved imports from the closest `package.json` from `config.input`. The key is the import symbol
    * and value is the reason why it failed to resolve entirely.
    *
    * @type {Map<string, string>}
    */
   const unresolvedImports = new Map();

   const parsePaths = async (fileList, topLevel = false) =>
   {
      const toParseFiles = new Set();

      for (const file of fileList)
      {
         let resolvedPath = upath.isAbsolute(file) ? file : upath.resolve(file);

         // Must indicate warnings for the case when an `index.js` / `index.mjs` file is referenced by directory.
         if (isDirectory(resolvedPath))
         {
            const hasIndexJs = isFile(`${resolvedPath}/index.js`);
            const hasIndexMjs = isFile(`${resolvedPath}/index.mjs`);

            if (!hasIndexJs && !hasIndexMjs)
            {
               // Could not resolve index reference so skip file.
               logger.warn(`parseFiles warning: detected bare directory import without expected '/index.(m)js'`);

               continue;
            }
            // else
            // {
            //    logger.warn(`parseFiles warning: could not resolve directory; '${resolvedPath}'`);
            // }

            if (hasIndexJs) { resolvedPath = `${resolvedPath}/index.js`; }
            else if (hasIndexMjs) { resolvedPath = `${resolvedPath}/index.mjs`; }
         }

         if (parsedFiles.has(resolvedPath)) { continue; }

         parsedFiles.add(resolvedPath);

         const dirpath = upath.dirname(resolvedPath);

         if (!isFile(resolvedPath))
         {
            if (isFile(`${resolvedPath}.js`)) { resolvedPath = `${resolvedPath}.js`; }
            else if (isFile(`${resolvedPath}.mjs`)) { resolvedPath = `${resolvedPath}.mjs`; }
            else
            {
               logger.warn(`parseFiles warning: could not resolve; '${resolvedPath}'`);
               continue;
            }
         }

         let fileData = fs.readFileSync(resolvedPath, 'utf-8').toString();

         // TODO: Consider multi-part file extensions in the future as applicable. `extname` extracts just the last.
         const fileExt = upath.extname(resolvedPath);

         // For non-Javascript files allow any loaded plugins to attempt to transform the file data.
         if (!regexJSExt.test(fileExt))
         {
            const transformed = await eventbus.triggerAsync(`lexer:transform:${fileExt}`, { fileData, logger, resolvedPath });
            if (typeof transformed !== 'string')
            {
               logger.warn(`Lexer failed to transform: ${resolvedPath}`);
               continue;
            }

            fileData = transformed;
         }

         lexerFilepaths.add(resolvedPath);

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
                  const result = resolvePkg.imports(packageObj, data.n, generateConfig.conditionImports);

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
                        if (isFile(fullpath))
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

      if (toParseFiles.size > 0) { await parsePaths(toParseFiles); }
   };

   await parsePaths(entrypoint, true);

   // Produce any warnings about unresolved imports specifiers.
   if (unresolvedImports.size > 0)
   {
      const keys = [...unresolvedImports.keys()].sort();
      for (const key of keys) { logger.warn(unresolvedImports.get(key)); }
   }

   return { lexerFilepaths: [...lexerFilepaths], packages: [...packages] };
}

/**
 * Parses top level exported packages retrieving any associated Typescript declaration file for the package.
 *
 * @param {string}         packageName - NPM package name.
 *
 * @param {GenerateConfig} generateConfig - The generate configuration.
 *
 * @returns {string} Returns any found TS declaration for the given package.
 */
function parsePackage(packageName, generateConfig)
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
      logger.warn(
       `parsePackage warning: Could not locate package.json for top level exported package; '${packageName}'`);

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
         if (resolvePath.match(s_REGEX_DTS_EXTENSIONS) && isFile(resolvePath)) { return `./${resolvePath}`; }
      }

      const exportConditionPath = resolvePkg.exports(packageJSON, exportPath, generateConfig.conditionExports);

      if (exportConditionPath)
      {
         // Now resolve any provided export condition configuration option or default to `imports`.
         resolvePath = upath.join(packageDir, ...exportConditionPath);

         // In the chance case that the user provided export condition matches `types` check again for declaration file
         // before changing the extension and resolving further.
         const resolveDTS = resolvePath.match(s_REGEX_DTS_EXTENSIONS) ? `./${resolvePath}` :
          `./${upath.changeExt(resolvePath, '.d.ts')}`;

         // Found a TS declaration directly associated with the export then return it.
         if (isFile(resolveDTS)) { return resolveDTS; }
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
         if (lastResolveDTS.match(s_REGEX_DTS_EXTENSIONS) && isFile(lastResolveDTS)) { return lastResolveDTS; }
      }
   }

   // Now check `package.json` `types` as last fallback.
   if (typeof packageJSON.types === 'string')
   {
      const lastResolveDTS = `./${upath.join(packageDir, packageJSON.types)}`;
      if (lastResolveDTS.match(s_REGEX_DTS_EXTENSIONS) && isFile(lastResolveDTS)) { return lastResolveDTS; }
   }

   // The reason this is gated behind a config option is that typically a package without an `exports` / `types` field
   // in `package.json` is indicative of an older package that might not have compliant types.
   if (generateConfig.checkDefaultPath)
   {
      const lastResolveDTS = `./${packageDir}/index.d.ts`;
      if (isFile(lastResolveDTS)) { return lastResolveDTS; }
   }

   return void 0;
}

/**
 * Processes an original GenerateConfig object returning all processed data required to compile / bundle DTS.
 *
 * @param {GenerateConfig} origConfig - The original GenerateConfig.
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
   const generateConfig = Object.assign({
      filterTags: 'internal',
      logLevel: 'info',
      removePrivateStatic: true,
      tsDiagnosticExternal: false,
      tsDiagnosticLog: true,
      tsFileWalk: true
   }, origConfig);

   // Set default output extension and output file if not defined.
   if (generateConfig.outputExt === void 0) { generateConfig.outputExt = '.d.ts'; }

   // If not defined change extension of input to DTS extension and use as output.
   if (generateConfig.output === void 0)
   {
      generateConfig.output = upath.changeExt(generateConfig.input, generateConfig.outputExt);
   }

   if (!validateConfig(generateConfig))
   {
      return `error: Aborting as 'config' failed validation.`;
   }

   logger.setLogLevel(generateConfig.logLevel);

   // Initialize plugin manager after logger log level set. Initialization only occurs once per entire invocation.
   await pluginManager.initialize();

   // Load default or configured `tsconfig.json` file to configure `compilerOptions`. --------------------------------

   let tsconfigPath;

   // Verify any tsconfig provided path.
   if (generateConfig.tsconfig)
   {
      if (isFile(generateConfig.tsconfig))
      {
         tsconfigPath = generateConfig.tsconfig;
      }
      else
      {
         return `error: Aborting as 'tsconfig' path is specified, but file does not exist; '${
          generateConfig.tsconfig}'`;
      }
   }
   else
   {
      // Check for default `./tsconfig.json`
      if (isFile('./tsconfig.json')) { tsconfigPath = './tsconfig.json'; }
   }

   /** @type {import('type-fest').TsConfigJson.CompilerOptions} */
   let tsconfigCompilerOptions = {};

   if (tsconfigPath)
   {
      logger.verbose(`Loading TS compiler options from 'tsconfig' path: ${tsconfigPath}`);

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
   const compilerOptionsJson = Object.assign(defaultCompilerOptions, generateConfig.compilerOptions,
    tsconfigCompilerOptions);

   // Apply config override if available.
   if (typeof generateConfig.tsCheckJs === 'boolean') { compilerOptionsJson.checkJs = generateConfig.tsCheckJs; }

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
   generateConfig.input = upath.resolve(generateConfig.input);

   // Get all files ending in `.ts` that are not declarations in the entry point folder or sub-folders. These TS files
   // will be compiled and added to the declaration bundle generated as synthetic wildcard exports.
   const tsFilepaths = await getFileList({
      dir: upath.dirname(generateConfig.input),
      includeFile: /^(?!.*\.d\.ts$).*\.ts$/,
      resolve: true,
      walk: generateConfig.tsFileWalk
   });

   // Parse input source file and gather any top level NPM packages that may be referenced.
   const { lexerFilepaths, packages } = await parseFiles(generateConfig);

   // Parsed input source files and any TS files found from input root.
   const compileFilepaths = [...lexerFilepaths, ...tsFilepaths];

   // Common path for all input source files linked to the entry point.
   const commonPathFiles = commonPath(...compileFilepaths);

   // Update options / configuration based on common parsed files path -----------------------------------------------

   // Adjust compilerOptions rootDir to common path of all source files detected.
   if (compilerOptions.rootDir === void 0)
   {
      compilerOptions.rootDir = commonPathFiles === '' && compileFilepaths.length === 1 ?
       upath.dirname(compileFilepaths[0]) : commonPathFiles;
   }

   // ---

   // Find the common base path for all parsed files and find the relative path to the input source file.
   const localRelativePath = commonPathFiles !== '' ? upath.relative(commonPathFiles, generateConfig.input) :
    upath.basename(generateConfig.input);

   // Get the input DTS entry point; this is without DTS extension change which occurs after compilation.
   const dtsEntryPath = `${compilerOptions.outDir}/${localRelativePath}`;
   const dtsDirectoryPath = compilerOptions.outDir;

   // ---

   // Relative path from current working directory to local common path. Used for filtering diagnostic errors.
   const inputRelativeDir = upath.relative(process.cwd(), commonPathFiles);

   // ----------------------------------------------------------------------------------------------------------------

   return {
      compileFilepaths,
      compilerOptions,
      dtsDirectoryPath,
      dtsEntryPath,
      generateConfig,
      inputRelativeDir,
      lexerFilepaths,
      packages,
      tsFilepaths
   };
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
 * @param {GenerateConfig} generateConfig - The generate configuration.
 *
 * @param {string}   outDir - The DTS output directory path.
 *
 * @returns {{}[]} Resolved local package types.
 */
function resolvePackageExports(packages, generateConfig, outDir)
{
   const packageAlias = [];

   for (const packageName of packages)
   {
      const resolveDTS = parsePackage(packageName, generateConfig);
      if (!resolveDTS)
      {
         logger.warn(`resolvePackageExports warning: Could not locate TS declaration for package; '${packageName}'.`);

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
 * @property {boolean | import('@typhonjs-build-test/rollup-plugin-pkg-imports').ImportsResolvePluginOptions} [importsResolve]
 * When defined enables `importsResolve` from the `@typhonjs-build-test/rollup-plugin-pkg-imports` package.
 *
 * @property {'off' | 'fatal' | 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'trace' | 'all'} [logLevel='info']
 * Defines the logging level.
 *
 * @property {string}               [output] The output file path for the bundled TS declarations.
 *
 * @property {string}               [outputExt='.d.ts'] The bundled output TS declaration file extension. Normally a
 * complete `output` path is provided when using `generateDTS`, but this can be useful when using the Rollup plugin to
 * change the extension as desired.
 *
 * @property {string}               [outputGraph] Outputs the package dependency graph to the given file path. The
 * graph JSON is suitable for use in various graph libraries like cytoscape / Svelte Flow / amongst others.

 * @property {number}               [outputGraphIndentation] When outputting the dependency graph use this indentation
 * value for the JSON output.
 *
 * @property {string}               [outputPostprocess] When postprocessing is configured this is a helpful debugging
 * mechanism to output the postprocessed declarations to a separate file making it easier to compare the results of
 * any additional processing. You must specify a valid filepath.
 *
 * @property {Iterable<import('@typhonjs-build-test/esm-d-ts/postprocess').ProcessorFunction>} [postprocess] An
 * iterable list of postprocessing functions. Note: This is experimental!
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
 * @property {boolean} [tsFileWalk=true] When true all TS files located at the `input` path and all subdirectories
 * are included as synthetic exports in the generated declarations. Setting to false only includes TS files in the
 * direct `input` path.
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
 * @property {(warning: import('rollup').RollupLog,
 * defaultHandler: (warning: string | import('rollup').RollupLog) => void) => void} [rollupOnwarn] Rollup `onwarn`
 * option. {@link https://rollupjs.org/configuration-options/#onwarn}
 */

/**
 * @typedef {object} ProcessedConfig Contains the processed config and associated data.
 *
 * @property {string[]}    compileFilepaths A list of all file paths to compile.
 *
 * @property {ts.CompilerOptions} compilerOptions TS compiler options.
 *
 * @property {string}      dtsDirectoryPath The directory path for intermediate TS declarations generated.
 *
 * @property {string}      dtsEntryPath The entry point path for intermediate TS declarations generated.
 *
 * @property {GenerateConfig} generateConfig The original generate generateConfig w/ default data.
 *
 * @property {string}      inputRelativeDir Relative directory of common project files path.
 *
 * @property {string[]}    lexerFilepaths The lexically parsed original file paths connected with the entry point.
 *
 * @property {string[]}    packages Top level packages exported from entry point.
 *
 * @property {string[]}    tsFilepaths A list of all TS files to add synthetic exports.
 */
