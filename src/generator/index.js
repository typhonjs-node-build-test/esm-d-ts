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
import { exports }               from 'resolve.exports';
import { rollup }                from 'rollup';
import dts                       from 'rollup-plugin-dts';
import ts                        from 'typescript';
import upath                     from 'upath';


import * as internalPlugins      from './plugins.js';

import { jsdocRemoveNodeByTags } from '../transformer/index.js';

import {
   addSyntheticExports,
   removePrivateStatic }         from '../transformer/internal/index.js';

/**
 * Generates TS declarations from ESM source.
 *
 * @param {GenerateConfig} options - Generation configuration object.
 *
 * @returns {Promise<void>}
 */
async function generateDTS(options)
{
   // Initial sanity checks.
   if (!isObject(options))
   {
      console.error(`esm-d-ts generateDTS error: Aborting as 'config' is not an object.`);
      return;
   }

   if (options.compilerOptions !== void 0 && !isObject(options.compilerOptions))
   {
      console.error(`esm-d-ts generateDTS error: Aborting as 'config.compilerOptions' is not an object.`);
      return;
   }

   /**
    * A shallow copy of configuration options w/ default values for `filterTags` and `removePrivateStatic`.
    *
    * @type {GenerateConfig}
    */
   const config = Object.assign({ checkJs: false, filterTags: 'internal', removePrivateStatic: true }, options);

   // Set default output extension and output file if not defined.
   if (config.outputExt === void 0) { config.outputExt = '.d.ts'; }
   if (config.output === void 0) { config.output = `./types/index${config.outputExt}`; }

   if (!validateOptions(config))
   {
      console.error(`esm-d-ts generateDTS error: Aborting as 'config' failed validation.`);
      return;
   }

   let compilerOptions = Object.assign({ checkJs: config.checkJs }, s_DEFAULT_TS_OPTIONS, config.compilerOptions);

   // Validate compiler options with Typescript.
   compilerOptions = validateCompilerOptions(compilerOptions);

   // Return now if compiler options failed to validate.
   if (!compilerOptions)
   {
      console.error(`esm-d-ts generateDTS error: Aborting as 'config.compilerOptions' failed validation.`);
      return;
   }

   // Empty intermediate declaration output directory.
   if (fs.existsSync(compilerOptions.outDir)) { fs.emptyDirSync(compilerOptions.outDir); }

   // Parse imports from package.json resolved from input entry point.
   const importMap = parsePackageImports(config.input);

   // Get all files ending in `.ts` that are in the entry point folder or sub-folders. These TS files will be compiled
   // and added to the declaration bundle generated as synthetic wildcard exports.
   const tsFilepaths = await getFileList({
      dir: upath.dirname(config.input),
      ext: new Set(['.ts']),
      skipEndsWith: '.d.ts'
   });

   // Resolve to full path.
   config.input = upath.resolve(config.input);

   // Note: TS still doesn't seem to resolve import paths from `package.json`, so add any parsed import paths.
   const filepaths = [config.input, ...tsFilepaths, ...importMap.values()];

   // Parse input source file and gather any top level NPM packages that may be referenced.
   const { files, packages } = await parseFiles([config.input], importMap);

   // Common path for all input source files linked to the entry point.
   const parseFilesCommonPath = commonPath(...files);

   compile(filepaths, tsFilepaths, compilerOptions, config, parseFilesCommonPath);

   await bundleTS({ ...config, outDir: compilerOptions.outDir }, packages, parseFilesCommonPath);
}

/**
 * Provides a Rollup plugin generating a bundled TS declaration after the bundle has been written.
 *
 * @type {(options?: import('.').GeneratePluginConfig) => import('rollup').Plugin}
 */
generateDTS.plugin = internalPlugins.generateDTSPlugin(generateDTS);

export { generateDTS };

// Internal Implementation -------------------------------------------------------------------------------------------

/**
 * @param {GenerateConfig & {outDir: string}} config - The config used to generate TS declarations.
 *
 * @param {Set<string>} packages - All top level imported packages.
 *
 * @param {string}      parseFilesCommonPath - The common path for all files referenced by input entry point.
 *
 * @returns {Promise<void>}
 */
async function bundleTS(config, packages, parseFilesCommonPath)
{
   // Find the common base path for all parsed files and find the relative path to the input source file.
   const inputRelativePath = parseFilesCommonPath !== '' ? upath.relative(parseFilesCommonPath, config.input) :
    upath.basename(config.input);

   // Get the input DTS entry point; append inputRelativePath after changing extensions to the compilerOptions outDir.
   const dtsMain = `${config.outDir}/${upath.changeExt(inputRelativePath, '.d.ts')}`;

   const packageAlias = typeof config.bundlePackageExports === 'boolean' && config.bundlePackageExports ?
    resolvePackageExports(packages, config) : [];

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

         console.warn(`esm-d-ts - warning could not prepend file: '${prependFile}'.`);
      }
   }

   if (isIterable(config.prependString))
   {
      for (const prependStr of config.prependString) { banner += prependStr; }
   }

   const plugins = [];

   // Add `importsExternal` plugin if configured.
   if (isObject(config.importsExternalOptions))
   {
      plugins.push(importsExternal(config.importsExternalOptions));
   }

   // Add `importsResolve` plugin if configured.
   if (isObject(config.importsResolveOptions))
   {
      plugins.push(importsResolve(config.importsResolveOptions));
   }

   plugins.push(...[
      alias({ entries: packageAlias }),
      dts()
   ]);

   const rollupConfig = {
      input: {
         input: dtsMain,
         plugins
      },
      output: {
         banner,
         file: config.output,
         format: 'es',
      }
   };

   // Further config modification through optional GenerateConfig parameters -----------------------------------------

   if (config.external !== void 0) { rollupConfig.input.external = config.external; }

   if (config.onwarn !== void 0) { rollupConfig.input.onwarn = config.onwarn; }

   if (config.paths !== void 0) { rollupConfig.output.paths = config.paths; }

   if (isObject(config.replace)) { rollupConfig.input.plugins.push(internalPlugins.naiveReplace(config.replace)); }

   // ----------------------------------------------------------------------------------------------------------------

   const bundle = await rollup(rollupConfig.input);
   await bundle.write(rollupConfig.output);
   await bundle.close();
}

/**
 * Compiles TS declaration files from the provided list of ESM & TS files.
 *
 * @param {string[]}             filepaths - A list of all file paths to compile.
 *
 * @param {string[]}             tsFilepaths - A list of all TS files to add synthetic exports.
 *
 * @param {ts.CompilerOptions}   options - TS compiler options.
 *
 * @param {GenerateConfig}       config - Configuration object.
 *
 * @param {string}               parseFilesCommonPath - The common path for all files referenced by input entry point.
 */
function compile(filepaths, tsFilepaths, options, config, parseFilesCommonPath)
{
   delete options.paths;

   if (options.rootDir === void 0)
   {
      options.rootDir = parseFilesCommonPath === '' && filepaths.length === 1 ? upath.dirname(filepaths[0]) :
       parseFilesCommonPath;
   }

   const host = ts.createCompilerHost(options, /* setParentNodes */ true);

   // Prepare and emit the d.ts files
   const program = ts.createProgram(filepaths, options, host);

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
      ...(isIterable(config.transformers) ? config.transformers : [])
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

   // Provide a default implementation to allow all diagnostic messages through.
   const filterDiagnostic = config.filterDiagnostic ?? (() => false);

   for (const diagnostic of allDiagnostics)
   {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

      if (filterDiagnostic(diagnostic, message)) { continue; }

      if (diagnostic.file)
      {
         const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
         const fileName = upath.relative(process.cwd(), diagnostic.file.fileName);
         console.error(`${fileName} (${line + 1},${character + 1}): ${message}`);
      }
      else
      {
         console.error(message);
      }
   }
}

/**
 * Fully parses all file paths provided. Includes top level "re-exported" packages in `packages` data.
 *
 * @param {Iterable<string>} filepaths - List of file paths to parse.
 *
 * @param {Map<string, string>} [importMap] - An optional map of imports from a given package.json
 *
 * @returns {Promise<{files: Set<string>, packages: Set<string>}>} Parsed files and top level packages exported.
 */
async function parseFiles(filepaths, importMap = new Map())
{
   await init;

   const parsedFiles = new Set();

   const files = new Set();
   const packages = new Set();

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
               console.warn(
                `esm-d-ts - parse warning: detected bare directory import without expected '/index.(m)js'`);
            }
            else
            {
               console.warn(`esm-d-ts - parse warning: could not resolve directory: ${resolved}`);
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
               console.warn(`esm-d-ts - parse warning: could not resolve: ${resolved}`);
               continue;
            }
         }

         files.add(resolved);

         const fileData = fs.readFileSync(resolved, 'utf-8').toString();

         const [imports] = parse(fileData);

         for (const data of imports)
         {
            if (data.n === void 0 || data.d === -2) { continue; }

            // Check importMap for paths specified in `package.json` imports.
            if (data.n.startsWith('#') && importMap.has(data.n))
            {
               data.n = importMap.get(data.n);
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
      // packagePath = `./${upath.relative('.', requireMod.resolve(`${match[1]}/package.json`))}`;
      packagePath = fileURLToPath(resolve(`${match[1]}/package.json`, import.meta.url));

      packageJSON = JSON.parse(fs.readFileSync(packagePath, 'utf-8').toString());
   }
   catch (err)
   {
      try
      {
         // Attempt to load exact package name / path.
         // const exportedPath = `./${upath.relative('.', requireMod.resolve(packageName))}`;
         const exportedPath = fileURLToPath(resolve(packageName, import.meta.url));

         const { packageObj, filepath } = getPackageWithPath({ filepath: exportedPath });

         packageJSON = packageObj;
         packagePath = filepath;
      }
      catch (err) { /**/ }
   }

   if (typeof packageJSON !== 'object')
   {
      console.warn(`esm-d-ts - warning could not locate package.json; top level exported package: ${packageName}`);
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

      const exportTypesPath = exports(packageJSON, exportPath, { conditions: ['types'] });

      let resolvePath;

      if (exportTypesPath)
      {
         // Resolve any export path with `resolve.export`.
         // First attempt to resolve most recent Typescript support for `types` in exports.
         resolvePath = upath.join(packageDir, ...exportTypesPath);

         // If a declaration is found and the file exists return now.
         if (resolvePath.match(s_REGEX_DTS_EXTENSIONS) && fs.existsSync(resolvePath)) { return `./${resolvePath}`; }
      }

      const exportConditionPath = exports(packageJSON, exportPath, config.exportCondition);

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
 * Parses the closest package.json to `resolvePath` resolving any imports that directly point to a string / file path.
 *
 * @param {string}   filepath - A file path to resolve closest `package.json`.
 *
 * @returns {Map<string, string>} Import map.
 */
function parsePackageImports(filepath)
{
   /** @type {Map<string, string>} */
   const importMap = new Map();

   // Now attempt to find the nearest `package.json` that isn't the root `package.json`.
   const { packageObj } = getPackageWithPath({ filepath });

   if (packageObj && typeof packageObj.imports === 'object')
   {
      for (const [key, value] of Object.entries(packageObj.imports))
      {
         if (typeof value === 'string')
         {
            const resolvedPath = upath.resolve(value);
            if (fs.existsSync(resolvedPath))
            {
               importMap.set(key, resolvedPath);
            }
         }
      }
   }

   return importMap;
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
 * @returns {{}[]} Resolved local package types.
 */
function resolvePackageExports(packages, config)
{
   const packageAlias = [];

   for (const packageName of packages)
   {
      const resolveDTS = parsePackage(packageName, config);
      if (!resolveDTS)
      {
         console.warn(
          `esm-d-ts - resolvePackageExports warning: Could not locate TS declaration for '${packageName}'.`);
         continue;
      }

      const dtsBasename = upath.basename(resolveDTS);

      const dtsFileData = fs.readFileSync(resolveDTS, 'utf-8');
      const outputDir = `${config.outDir}${upath.sep}._node_modules${upath.sep}${packageName}`;
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
 * Validates the TS compiler options.
 *
 * @param {ts.CompilerOptions} compilerOptions - The TS compiler options.
 *
 * @returns {ts.CompilerOptions|void} The validated compiler options or undefined if failure.
 */
function validateCompilerOptions(compilerOptions)
{
   // Validate `config.compilerOptions` ------------------------------------------------------------------------------

   // Use the current working directory as the base path.
   const basePath = process.cwd();

   const { options, errors } = ts.convertCompilerOptionsFromJson(compilerOptions, basePath);

   if (errors.length > 0)
   {
      for (const error of errors) { console.error(ts.flattenDiagnosticMessageText(error.messageText, '\n')); }
      return void 0;
   }

   return options;
}

/**
 * Validates all config object parameters except `compilerOptions`.
 *
 * TODO: Finish extensive validation checking.
 *
 * @param {GenerateConfig} config - A generate config.
 *
 * @returns {boolean} Validation state.
 */
function validateOptions(config)
{
   if (typeof config.input !== 'string')
   {
      console.error(`esm-d-ts validateOptions error: 'config.input' is not a string.`);
      return false;
   }

   if (!fs.existsSync(config.input))
   {
      console.error(`esm-d-ts validateOptions error: 'config.input' file does not exist.`);
      return false;
   }

   if (typeof config.output !== 'string')
   {
      console.error(`esm-d-ts validateOptions error: 'config.output' is not a string.`);
      return false;
   }

   if (config.checkJs !== void 0 && typeof config.checkJs !== 'boolean')
   {
      console.error(`esm-d-ts validateOptions error: 'config.checkJs' is not a boolean.`);
      return false;
   }

   return true;
}

/**
 * @type {ts.CompilerOptions}
 */
const s_DEFAULT_TS_OPTIONS = {
   allowJs: true,
   declaration: true,
   emitDeclarationOnly: true,
   moduleResolution: 'bundler',
   module: 'es2022',
   target: 'es2022',
   outDir: './.dts'
};

const s_REGEX_DTS_EXTENSIONS = /\.d\.(c|m)?tsx?$/;
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
 * @property {string}               [output='./types/index.d.ts'] The bundled output TS declaration path.
 *
 * @property {boolean}              [bundlePackageExports=false] When true attempt to bundle types of top level
 * exported packages. This is useful for re-bundling libraries.
 *
 * @property {boolean}              [checkDefaultPath=false] When true and bundling top level package exports check
 * for `index.d.ts` in package root.
 *
 * @property {boolean}              [checkJs=false] When true set `checkJs` to default compiler options. This is a
 * convenience parameter to quickly turn `checkJs` on / off.
 *
 * @property {import('resolve.exports').Options}   [exportCondition] `resolve.exports` conditional options for
 * `package.json` exports field type.
 *
 * @property {string|Iterable<string>|false|null|undefined} [filterTags='internal'] By default
 * `jsdocRemoveNodeByTags('internal')` transformer is automatically added removing all AST nodes that have the
 * `@internal` tag. To generate declarations with internal tags set to `false` / null / undefined.
 *
 * @property {import('@typhonjs-build-test/rollup-plugin-pkg-imports').ImportsPluginOptions} [importsExternalOptions]
 * Options to configure `@typhonjs-build-test/rollup-plugin-pkg-imports` `importsExternal` plugin.
 *
 * @property {import('@typhonjs-build-test/rollup-plugin-pkg-imports').ImportsPluginOptions} [importsResolveOptions]
 * Options to configure `@typhonjs-build-test/rollup-plugin-pkg-imports` `importsResolve` plugin.
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
 * @property {Record<string, string>} [replace] - Options for naive text replacement operating on the final bundled
 * TS declaration file.
 *
 * // Typescript specific options for compilation --------------------------------------------------------------------
 *
 * @property {ts.CompilerOptions}   [compilerOptions] - Typescript compiler options.
 * {@link https://www.typescriptlang.org/tsconfig}
 *
 * @property {(diagnostic: import('typescript').Diagnostic, message?: string) => boolean} [filterDiagnostic] - Optional
 * filter function to handle diagnostic messages in a similar manner as the `onwarn` Rollup callback. Return `true` to
 * filter the given diagnostic from posting to `console.error`.
 *
 * @property {Iterable<ts.TransformerFactory<ts.Bundle | ts.SourceFile> | ts.CustomTransformerFactory>} [transformers]
 * A list of TransformerFactory or CustomTransformerFactory functions to process generated declaration AST while
 * emitting intermediate types for bundling. {@link https://github.com/itsdouges/typescript-transformer-handbook}
 *
 * // Rollup specific options that are the same as Rollup configuration options when bundling declaration file -------
 *
 * @property {(string | RegExp)[] | RegExp | string |
 * ((id: string, parentId: string, isResolved: boolean) => boolean)}  [external] - Rollup `external` option.
 * {@link https://rollupjs.org/configuration-options/#external}
 *
 * @property {Record<string, string> | ((id: string) => string)} [paths] - Rollup `paths` option.
 * {@link https://rollupjs.org/configuration-options/#output-paths}
 *
 * @property {(warning: import('rollup').RollupWarning,
 * defaultHandler: (warning: string | import('rollup').RollupWarning) => void) => void} [onwarn] - Rollup `onwarn`
 * option. {@link https://rollupjs.org/configuration-options/#onwarn}
 */
