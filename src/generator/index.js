/**
 * Provides the main entry points to the package including `checkDTS` and `generateDTS`.
 *
 * @module
 */

import { fileURLToPath }         from 'node:url';

import alias                     from '@rollup/plugin-alias';
import { importsExternal }       from '@typhonjs-build-test/rollup-plugin-pkg-imports';

import {
   commonPath,
   getFileList,
   isDirectory,
   isFile }                      from '@typhonjs-utils/file-util';

import {
   deepFreeze,
   isIterable,
   isObject }                    from '@typhonjs-utils/object';

import { getPackageWithPath }    from '@typhonjs-utils/package-json';
import { init, parse }           from 'es-module-lexer';
import fs                        from 'fs-extra';
import globToRegExp              from 'glob-to-regexp';
import { resolve }               from 'import-meta-resolve';
import * as prettier             from 'prettier';
import * as resolvePkg           from 'resolve.exports';
import { rollup }                from 'rollup';
import dts                       from 'rollup-plugin-dts';
import ts                        from 'typescript';
import upath                     from 'upath';

import { DTSPluginManager }      from './plugins/DTSPluginManager.js';
import * as rollupPlugins        from './plugins/rollupPlugins.js';

import {
   regexJSExt,
   validateCompilerOptions,
   validateConfig }              from './validation.js';

import { PostProcess }           from '../postprocess/index.js';
import { outputGraph }           from '../postprocess/internal/outputGraph.js';

import { jsdocRemoveNodeByTags } from '../transformer/index.js';

import {
   addSyntheticExports,
   jsdocImplementsImportType,
   jsdocPreserveModuleTag,
   jsdocSetterParamName,
   removePrivateStatic }         from '../transformer/internal/index.js';

import {
   isDTSFile,
   isTSFile,
   logger }                      from '#util';

/**
 * Invokes TS compiler in `checkJS` mode without processing DTS.
 *
 * @param {GenerateConfig | Iterable<GenerateConfig>} config - Generation configuration object.
 *
 * @returns {Promise<boolean>} All operations successful.
 */
async function checkDTS(config)
{
   let result = true;

   // Initial sanity checks.
   if (!isObject(config) && !isIterable(config))
   {
      logger.error(`error: Aborting as 'config' must be an object or iterable list of objects.`);
      return false;
   }

   try
   {
      if (isIterable(config))
      {
         for (const entry of config)
         {
            const processedConfigOrError = await processConfig(entry, s_DEFAULT_TS_CHECK_COMPILER_OPTIONS,
             { tsCheckJs: true });

            if (typeof processedConfigOrError === 'string')
            {
               logger.error(`checkDTS ${processedConfigOrError}`);
               logger.error(`Entry point: ${entry?.input}`);
               result = false;
               continue;
            }

            logger.info(`Checking DTS bundle for: ${entry?.input}`);

            await checkDTSImpl(processedConfigOrError);
         }
         /* v8 ignore next 1 */ // `}` / line below is reached, but left out of coverage.
      }
      else
      {
         const processedConfigOrError = await processConfig(config, s_DEFAULT_TS_CHECK_COMPILER_OPTIONS,
          { tsCheckJs: true });

         if (typeof processedConfigOrError === 'string')
         {
            logger.error(`checkDTS ${processedConfigOrError}`);
            logger.error(`Entry point: ${config?.input}`);
            result = false;
         }
         else
         {
            logger.info(`Checking DTS bundle for: ${config?.input}`);

            await checkDTSImpl(processedConfigOrError);
         }
      }
   }
   catch (err)
   {
      logger.fatal(`A fatal uncaught exception has been raised. Terminating processing.`);
      logger.debug(err);
      result = false;
   }

   return result;
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
   const { eventbus } = processedConfig;

   try
   {
      await eventbus.triggerAsync('lifecycle:start', { processedConfig });
   }
   catch (err)
   {
      logger.error(`External plugin error for event 'lifecycle:start': ${err.message}`);

      throw err;
   }

   await compile(processedConfig, false);

   try
   {
      await eventbus.triggerAsync('lifecycle:end', { processedConfig });
   }
   catch (err)
   {
      logger.error(`External plugin error for event 'lifecycle:end': ${err.message}`);

      throw err;
   }
}

/**
 * Generates TS declarations from ESM source.
 *
 * @param {GenerateConfig | Iterable<GenerateConfig>} config - Generation configuration object.
 *
 * @returns {Promise<boolean>} All Operations successful.
 */
async function generateDTS(config)
{
   let result = true;

   // Initial sanity checks.
   if (!isObject(config) && !isIterable(config))
   {
      logger.error(`error: Aborting as 'config' must be an object or iterable list of objects.`);
      return false;
   }

   try
   {
      if (isIterable(config))
      {
         for (const entry of config)
         {
            const processedConfigOrError = await processConfig(entry, s_DEFAULT_TS_GEN_COMPILER_OPTIONS);

            if (typeof processedConfigOrError === 'string')
            {
               logger.error(`generateDTS ${processedConfigOrError}`);
               logger.error(`Entry point: ${entry?.input}`);
               result = false;
               continue;
            }

            logger.info(`Generating DTS bundle for: ${entry?.input}`);

            await generateDTSImpl(processedConfigOrError);
         }
         /* v8 ignore next 1 */ // `}` / line below is reached, but left out of coverage.
      }
      else
      {
         const processedConfigOrError = await processConfig(config, s_DEFAULT_TS_GEN_COMPILER_OPTIONS);

         if (typeof processedConfigOrError === 'string')
         {
            logger.error(`generateDTS ${processedConfigOrError}`);
            logger.error(`Entry point: ${config?.input}`);
            result = false;
         }
         else
         {
            logger.info(`Generating DTS bundle for: ${config?.input}`);

            await generateDTSImpl(processedConfigOrError);
         }
      }
   }
   catch (err)
   {
      logger.fatal(`A fatal uncaught exception has been raised. Terminating processing.`);
      logger.debug(err);
      result = false;
   }

   return result;
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
   const { dtsDirectoryPath, eventbus, generateConfig } = processedConfig;

   logger.debug(`Intermediate declarations output path: ${upath.relative(process.cwd(), dtsDirectoryPath)}`);

   try
   {
      await eventbus.triggerAsync('lifecycle:start', { processedConfig });
   }
   catch (err)
   {
      logger.error(`External plugin error for event 'lifecycle:start': ${err.message}`);

      throw err;
   }

   // Empty intermediate declaration output directory.
   if (isDirectory(dtsDirectoryPath)) { fs.emptyDirSync(dtsDirectoryPath); }

   // Log emit diagnostics as warnings.
   const { dtsEntryPathActual, jsdocModuleComments } = await compile(processedConfig, true);

   await bundleDTS(processedConfig, dtsEntryPathActual, jsdocModuleComments);

   // Run prettier on the bundled output file.
   if (generateConfig.prettier !== void 0)
   {
      /** @type {import('prettier').Options} */
      let prettierOptions;

      if (typeof generateConfig.prettier === 'boolean' && generateConfig.prettier)
      {
         prettierOptions = { parser: 'typescript', printWidth: 120, singleQuote: true };
      }
      else if (isObject(generateConfig.prettier))
      {
         // Always use the `typescript` parser.
         prettierOptions = Object.assign({}, generateConfig.prettier, { parser: 'typescript' });
      }

      if (prettierOptions)
      {
         const text = fs.readFileSync(generateConfig.output, 'utf-8');
         const formatted = await prettier.format(text, prettierOptions);
         fs.writeFileSync(generateConfig.output, formatted);
      }
   }

   try
   {
      await eventbus.triggerAsync('lifecycle:end', { processedConfig });
   }
   catch (err)
   {
      logger.error(`External plugin error for event 'lifecycle:end': ${err.message}`);

      throw err;
   }
}

/**
 * Provides a Rollup plugin generating a bundled TS declaration after the bundle has been written.
 *
 * @type {(options?: Partial<GenerateConfig>) => import('rollup').Plugin}
 */
generateDTS.plugin = rollupPlugins.generateDTSPlugin(generateDTS);

export { checkDTS, generateDTS };

// Internal Implementation -------------------------------------------------------------------------------------------

/**
 * @param {ProcessedConfig}   processedConfig - Processed config.
 *
 * @param {string} dtsEntryPathActual - The actual processed DTS entry path.
 *
 * @param {{ comment: string, filepath: string}[]} [jsdocModuleComments] - Any comments with the `@module` tag.
 *
 * @returns {Promise<void>}
 */
async function bundleDTS(processedConfig, dtsEntryPathActual, jsdocModuleComments = [])
{
   const { generateConfig, packageObj } = processedConfig;

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
      plugins.push(importsExternal(isObject(generateConfig.importsExternal) ?
       { packageObj, ...generateConfig.importsExternal } : { packageObj }));
   }

   plugins.push(...[
      alias({ entries: resolvePackageExports(processedConfig) }),
      alias({ entries: resolveLocalImports(processedConfig) }),
      dts()
   ]);

   const rollupConfig = {
      input: {
         input: dtsEntryPathActual,
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
      rollupConfig.input.plugins.push(rollupPlugins.naiveReplace(generateConfig.dtsReplace));
   }

   // ----------------------------------------------------------------------------------------------------------------

   const bundle = await rollup(rollupConfig.input);
   await bundle.write(rollupConfig.output);
   await bundle.close();

   // Collect the postprocessor functions.
   const processors = [...(isIterable(generateConfig.postprocess) ? generateConfig.postprocess : [])];

   // Add the internal `outputGraph` post processor if `config.outputGraph` is defined.
   if (typeof generateConfig.outputGraph === 'string')
   {
      processors.push(outputGraph(generateConfig.outputGraph, generateConfig.outputGraphIndentation));
   }

   // Handle any postprocessing of the bundled declarations.
   if (processors.length)
   {
      PostProcess.process({
         filepath: generateConfig.output,
         output: generateConfig.outputPostprocess,
         processors,
         dependencies: true,
         logStart: true
      });
   }

   logger.verbose(`Output bundled DTS file to: ${generateConfig.output}`);
}

/**
 * Compiles TS declaration files from the provided list of ESM & TS files.
 *
 * @param {ProcessedConfig}   processedConfig - Processed config object.
 *
 * @param {boolean}  isGenerate - Indicates compilation is from DTS generation vs just `checkJs`.
 *
 * @returns {(Promise<{
 *    dtsEntryPathActual: string,
 *    jsdocModuleComments: { comment: string, filepath: string }[]
 * }>)} The actual processed DTS entry path and any parsed JSDoc comments with the `@module` tag.
 */
async function compile(processedConfig, isGenerate)
{
   const {
      compilerOptions,
      compileFilepaths,
      dtsEntryPath,
      eventbus,
      generateConfig,
      inputRelativeDir,
      isTSMode,
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

   try
   {
      // Allow any plugins to handle non-JS files potentially modifying `compileFilepaths` and adding transformed code
      // to `memoryFiles`.
      await eventbus.triggerAsync('compile:transform', { logger, memoryFiles, processedConfig });
   }
   catch (err)
   {
      logger.error(`External plugin error for event 'compile:transform': ${err.message}`);

      throw err;
   }

   // Replace default CompilerHost `readFile` to be able to load transformed file data in memory.
   const origReadFile = host.readFile;
   host.readFile = (fileName) =>
   {
      /* v8 ignore next 1 */ // Covered in plugin package tests.
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
    * Optionally add `jsdocRemoveNodeByTags` to remove internal tags if `filterTags` is defined.
    */
   const alwaysTransformers = [
      jsdocPreserveModuleTag(jsdocModuleComments, generateConfig.input),

      ...(typeof generateConfig.filterTags === 'string' || isIterable(generateConfig.filterTags) ?
       [jsdocRemoveNodeByTags(generateConfig.filterTags)] : []),
   ];

   /**
    * Add `jsdocImplementsImportType` to support adding interfaces to classes via import types and `@implements`.
    *
    * Add `jsdocSetterParamName` to correct TS compiler renaming of setter param name.
    *
    * Optionally add `removePrivateStatic` as the Typescript compiler changes private static members to become public
    * defined with a string pattern that can be detected.
    *
    * Optionally add `addSyntheticExports` to add exports for any additional TS files compiled.
    */
   const jsTransformers = isTSMode ? [] : [
      jsdocImplementsImportType(),

      // TODO: The problem this transformer solves is fixed in TS 5.3+; Keep until minimum peer dependency is bumped.
      jsdocSetterParamName(),

      ...(typeof generateConfig.removePrivateStatic === 'boolean' && generateConfig.removePrivateStatic ?
       [removePrivateStatic()] : []),

      ...(tsFilepaths.length ? [addSyntheticExports(generateConfig.input, tsFilepaths)] : []),
   ];

   /**
    * Combines all transformers optionally including any user specified transformers.
    */
   const transformers = [
      ...alwaysTransformers,
      ...jsTransformers,
      ...(isIterable(generateConfig.tsTransformers) ? generateConfig.tsTransformers : [])
   ];

   if (transformers.length)
   {
      emitResult = program.emit(void 0, void 0, void 0, void 0, {
         afterDeclarations: transformers,
      });
   }
   /* v8 ignore next 4 */ // Currently there are always transformers.
   else
   {
      emitResult = program.emit();
   }

   const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

   // Default filter to exclude non-project files when option `tsDiagnosticExternal` is true and no explicit
   // `tsDiagnosticFilter` option is set.
   const filterExternalDiagnostic = ({ diagnostic }) =>
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

   /**
    * Helper method used to log a diagnostic instance. This is passed to plugins for consistent formatting.
    *
    * @param {import('typescript').Diagnostic}  diagnostic - A diagnostic to log.
    *
    * @param {import('@typhonjs-utils/logger-color').LogLevel} [logLevel='warn'] - Log level to use.
    */
   const diagnosticLog = (diagnostic, logLevel = 'warn') =>
   {
      /* v8 ignore next 5 */ // Any invalid log level is set to `warn`.
      if (!logger.isValidLevel(logLevel))
      {
         logger.warn(`[diagnosticLog] Unknown log level: ${logLevel}`);
         logLevel = 'warn';
      }

      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

      if (diagnostic.file)
      {
         const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
         const fileName = upath.relative(process.cwd(), diagnostic.file.fileName);
         logger.ext[`${logLevel}Raw`](`${fileName} (${line + 1},${character + 1})[33m: [TS] ${message}[0m`);
      }
      /* v8 ignore next 4 */ // All diagnostic messages should have an associated file.
      else
      {
         logger[logLevel](`[TS] ${message}`);
      }
   };

   for (const diagnostic of allDiagnostics)
   {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

      if (filterDiagnostic({ diagnostic, message })) { continue; }

      try
      {
         const result = await eventbus.triggerAsync('compile:diagnostic:filter',
          { diagnostic, diagnosticLog, logger, message });

         if (typeof result === 'boolean' && result) { continue; }
      }
      catch (err)
      {
         logger.error(`External plugin error for event 'compile:diagnostic:filter': ${err.message}`);

         throw err;
      }

      // Special handling for `generateDTS` / log as warnings.
      if (isGenerate)
      {
         // Only log if logLevel is not `error` or `tsDiagnosticLog` is true.
         if (!generateConfig.tsDiagnosticLog || !logger.is.warn) { continue; }

         diagnosticLog(diagnostic);
      }
      else
      {
         diagnosticLog(diagnostic);
      }
   }

   let dtsEntryPathActual;

   if (isGenerate)
   {
      // Find the output main path. This will be `.d.ts` for initial source files with `.js` extension.
      dtsEntryPathActual = upath.changeExt(dtsEntryPath, '.d.ts');

      // If that doesn't exist check for `.mts` which is generated for `.mjs` files.
      if (!isFile(dtsEntryPathActual)) { dtsEntryPathActual = upath.changeExt(dtsEntryPath, '.d.mts'); }

      /* v8 ignore next 8 */ // Only occurs if there is a s fatal error; not common.
      if (!isFile(dtsEntryPathActual))
      {
         logger.fatal(`compile error: could not locate DTS entry point file in output directory: ${
          compilerOptions.outDir}`);

         throw new Error(`compile error: could not locate DTS entry point file in output directory: ${
          compilerOptions.outDir}`);
      }
   }

   try
   {
      // Allow any plugins to handle postprocessing of generated DTS files.
      await eventbus.triggerAsync('compile:end', { logger, memoryFiles, PostProcess, processedConfig });
   }
   catch (err)
   {
      logger.error(`External plugin error for event 'compile:end': ${err.message}`);

      throw err;
   }

   return { dtsEntryPathActual, jsdocModuleComments };
}

/**
 * Convenience function to test whether an identifier string is formatted as a NPM package.
 *
 * @param {string}   identifier - Identifier to test.
 *
 * @returns {boolean} Is the value a NPM package identifier.
 */
function isPackage(identifier)
{
   return s_REGEX_PACKAGE.test(identifier) || s_REGEX_PACKAGE_SCOPED.test(identifier);
}

/**
 * Lexically parses all files connected to the entry point. Additional data includes top level "re-exported" packages
 * in `packages` data.
 *
 * @param {import('@typhonjs-plugin/manager/eventbus').EventbusSecure} eventbus - Plugin manager eventbus.
 *
 * @param {GenerateConfig} generateConfig - Generate config.
 *
 * @param {ts.CompilerOptions} compilerOptions - Typescript compiler options.
 *
 * @param {boolean} isTSMode - Is Typescript mode enabled.
 *
 * @returns {Promise<{
 *    lexerFilepaths: string[],
 *    localPackageImports: Map<string, string>,
 *    packages: Map<string, string>,
 *    packageObj: import('type-fest').PackageJson,
 *    success: boolean
 * }>} Lexically parsed files, top level packages exported, and closest `package.json` object from input source file.
 * When `success` is false this indicates there was an error encountered in parsing.
 */
async function parseFiles(eventbus, generateConfig, compilerOptions, isTSMode)
{
   await init;

   const { packageObj, filepathUnix } = getPackageWithPath({ filepath: generateConfig.input });

   const packageDir = upath.dirname(filepathUnix);

   deepFreeze(packageObj);

   let success = true;

   const entrypoint = [generateConfig.input];

   const parsedFiles = new Set();

   const lexerFilepaths = new Set();

   /**
    * Stores any top level exported packages.
    *
    * @type {Map<string, string>}
    */
   const packages = new Map();

   /**
    * Stores any local files referenced by `imports` in `package.json`.
    *
    * @type {Map<any, any>}
    */
   const localPackageImports = new Map();

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
         /* v8 ignore next 1 */ // `file` should always be the absolute path by this point.
         let resolvedPath = upath.isAbsolute(file) ? file : upath.resolve(file);

         // Must indicate warnings for the case when an `index.js` / `index.mjs` file is referenced by directory.
         if (isDirectory(resolvedPath))
         {

            /* v8 ignore start */
            // TS will not transpile malformed imports that don't have a proper `index.(m)ts` and diagnostic warnings
            // are ignored in `DTSPluginTypescript.lexerTransform`, diagnostic logs are not checked in `lexerTransform`.
            // The following code is never reached, but kept just in case for now.
            // TODO: Consider removing the if conditional code below.
            if (isTSMode)
            {
               const hasIndexTs = isFile(`${resolvedPath}/index.ts`);
               const hasIndexMts = isFile(`${resolvedPath}/index.mts`);

               if (!hasIndexTs && !hasIndexMts)
               {
                  // Could not resolve index reference so skip file.
                  logger.error(
                   `Parse files error: detected bare directory import without expected '/index.(m)ts'\ntarget: ${
                    resolvedPath}`);

                  success = false;
                  continue;
               }

               if (hasIndexTs) { resolvedPath = `${resolvedPath}/index.ts`; }
               else if (hasIndexMts) { resolvedPath = `${resolvedPath}/index.mts`; }
            }
            /* v8 ignore stop */
            else
            {
               const hasIndexJs = isFile(`${resolvedPath}/index.js`);
               const hasIndexMjs = isFile(`${resolvedPath}/index.mjs`);

               if (!hasIndexJs && !hasIndexMjs)
               {
                  // Could not resolve index reference so skip file.
                  logger.error(
                   `Parse files error: detected bare directory import without expected '/index.(m)js'\ntarget: ${
                     resolvedPath}`);

                  success = false;
                  continue;
               }

               if (hasIndexJs) { resolvedPath = `${resolvedPath}/index.js`; }
               else if (hasIndexMjs) { resolvedPath = `${resolvedPath}/index.mjs`; }
            }
         }

         if (parsedFiles.has(resolvedPath)) { continue; }

         parsedFiles.add(resolvedPath);

         const dirpath = upath.dirname(resolvedPath);

         if (!isFile(resolvedPath))
         {
            logger.error(`Parse files error: could not resolve; '${resolvedPath}'`);
            success = false;
            continue;
         }

         let fileData = fs.readFileSync(resolvedPath, 'utf-8').toString();

         // TODO: Consider multi-part file extensions in the future as applicable. `extname` extracts just the last.
         const fileExt = upath.extname(resolvedPath);

         // For non-Javascript files allow any loaded plugins to attempt to transform the file data.
         if (!regexJSExt.test(fileExt))
         {
            const event = `lexer:transform:${fileExt}`;

            try
            {
               const transformed = await eventbus.triggerAsync(event,
                { compilerOptions, fileData, logger, resolvedPath });

               /* v8 ignore next 4 */ // Not common fatal error.
               if (typeof transformed !== 'string')
               {
                  throw new Error(`External plugin failed to return a 'string'.`);
               }

               fileData = transformed;
            }
            catch (err)
            {
               logger.error(`Lexer failed to transform: ${resolvedPath}`);
               logger.error(`External plugin error for event '${event}': ${err.message}`);

               throw err;
            }
         }

         lexerFilepaths.add(resolvedPath);

         const [imports] = parse(fileData);

         for (const data of imports)
         {
            if (data.n === void 0 || data.d === -2) { continue; }

            // Stores original `imports` package alias if any.
            let packageAlias;

            // There is a local `imports` specifier so lookup and attempt to resolve via `resolve.exports` package.
            if (data.n.startsWith('#'))
            {
               let importpath;

               try
               {
                  const result = resolvePkg.imports(packageObj, data.n, generateConfig.conditionImports);

                  if (Array.isArray(result) && result.length)
                  {
                     const resultValue = result[0];

                     // Examine the first result returned and process if it starts with `.` indicating a local file.
                     // `config.conditionImports` should be provided for a more specific lookup as necessary.
                     if (resultValue?.startsWith?.('.'))
                     {
                        // Join `package.json` directory with local file path as there may be an intermediate
                        // `package.json` above the project root.
                        const fullpath = upath.resolve(upath.join(packageDir, resultValue));

                        if (isFile(fullpath))
                        {
                           importpath = fullpath;

                           if (!localPackageImports.has(data.n)) { localPackageImports.set(data.n, fullpath); }
                        }
                        else
                        {
                           if (!unresolvedImports.has(data.n))
                           {
                              unresolvedImports.set(data.n,
                               `Imports specifier '${data.n}' in package imports did not resolve to an existing file: ${
                                resultValue}.`);
                           }
                        }
                     }
                     else if (isPackage(resultValue))
                     {
                        // Store the original identifier in case it is an `imports` package alias.
                        packageAlias = data.n;
                        importpath = resultValue;
                     }
                  }
                  /* v8 ignore next 7 */ // `resolve.exports` throws on error, but this is a sanity catch all.
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

            /* v8 ignore next 5 */ // Not common - Hard to automate absolute path tests.
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
            if (topLevel && s_REGEX_EXPORT.exec(substring) && isPackage(data.n))
            {
               // Save any package imports alias as the key / value is resolved package name.
               packages.set(packageAlias ?? data.n, data.n);
            }
         }
      }

      if (toParseFiles.size > 0) { await parsePaths(toParseFiles); }
   };

   await parsePaths(entrypoint, true);

   // Produce any warnings about unresolved imports specifiers.
   if (unresolvedImports.size > 0)
   {
      success = false;

      const keys = [...unresolvedImports.keys()].sort();
      for (const key of keys) { logger.error(unresolvedImports.get(key)); }
   }

   return { lexerFilepaths: [...lexerFilepaths], localPackageImports, packages, packageObj, success };
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
      /* v8 ignore next 1 */ // No-op
      catch (err) { /**/ }
   }

   /* v8 ignore next 7 */ // Not common; unless a package is malformed.
   if (!isObject(packageJSON))
   {
      logger.warn(
       `parsePackage warning: Could not locate package.json for top level exported package; '${packageName}'`);

      return void 0;
   }

   const packageDir = `./${upath.relative('.', upath.dirname(packagePath))}`;

   // Handle parsing package exports.
   if (isObject(packageJSON.exports))
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
         if (isDTSFile(resolvePath)) { return `./${resolvePath}`; }
      }
   }
   else // Handle older fallback methods for defining default package types.
   {
      // Now check `package.json` `types`.
      if (typeof packageJSON.types === 'string')
      {
         const lastResolveDTS = `./${upath.join(packageDir, packageJSON.types)}`;
         if (isDTSFile(lastResolveDTS)) { return lastResolveDTS; }
      }

      // Now check `package.json` `typings`.
      if (typeof packageJSON.typings === 'string')
      {
         const lastResolveDTS = `./${upath.join(packageDir, packageJSON.typings)}`;
         if (isDTSFile(lastResolveDTS)) { return lastResolveDTS; }
      }

      // The reason this is gated behind a config option is that typically a package without an `exports` / `types`
      // field in `package.json` is indicative of an older package that might not have compliant types.
      if (generateConfig.checkDefaultPath)
      {
         const lastResolveDTS = `./${packageDir}/index.d.ts`;
         if (isDTSFile(lastResolveDTS)) { return lastResolveDTS; }
      }
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
 * @param {Partial<GenerateConfig>} extraConfig - Additional config parameters to override user supplied config.
 *
 * @returns {Promise<ProcessedConfig | string>} Processed config or error string.
 */
async function processConfig(origConfig, defaultCompilerOptions, extraConfig = {})
{
   // Initial sanity checks.
   if (!isObject(origConfig))
   {
      return `error: Aborting as 'config' must be an object.`;
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
      plugins: [],
      prettier: true,
      removePrivateStatic: true,
      tsDiagnosticExternal: false,
      tsDiagnosticLog: true,
      tsFileWalk: true
   }, origConfig, extraConfig);

   // Set default output extension and output file if not defined.
   if (generateConfig.outputExt === void 0) { generateConfig.outputExt = '.d.ts'; }

   let validationResult = true;

   if (typeof generateConfig.input !== 'string')
   {
      logger.error(`validateConfig error: 'config.input' must be a string.`);
      validationResult = false;
   }

   if (typeof generateConfig.outputExt !== 'string')
   {
      logger.error(`validateConfig error: 'config.outputExt' must be a string.`);
      validationResult = false;
   }

   if (!validationResult)
   {
      return `error: Aborting as 'config' failed validation.`;
   }

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

   // Resolve to full path.
   generateConfig.input = upath.resolve(generateConfig.input);

   const isTSMode = isTSFile(generateConfig.input);

   deepFreeze(generateConfig);

   const pluginManager = new DTSPluginManager();

   // Initialize plugin manager after logger log level set. Initialization only occurs once per entire invocation.
   await pluginManager.initialize(generateConfig, isTSMode);

   const eventbus = pluginManager.createEventbusSecure('esm-d-ts-eventbus');

   // Load default or configured `tsconfig.json` file to configure `compilerOptions`. --------------------------------

   /** @type {import('type-fest').TsConfigJson.CompilerOptions} */
   let tsconfigCompilerOptions = {};

   if (generateConfig.tsconfig)
   {
      logger.verbose(`Loading TS compiler options from 'tsconfig' path: ${generateConfig.tsconfig}`);

      try
      {
         const configJSON = JSON.parse(fs.readFileSync(generateConfig.tsconfig, 'utf-8').toString());
         if (isObject(configJSON?.compilerOptions)) { tsconfigCompilerOptions = configJSON.compilerOptions; }
      }
      catch (err)
      {
         return `error: Aborting as 'tsconfig' path is specified, but failed to load; '${
          err.message}'\ntsconfig path: ${generateConfig.tsconfig};`;
      }
   }

   // ----------------------------------------------------------------------------------------------------------------

   /** @type {import('type-fest').TsConfigJson.CompilerOptions} */
   const compilerOptionsJson = Object.assign({}, defaultCompilerOptions, generateConfig.compilerOptions,
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

   let tsFilepaths = [];

   if (!isTSMode)
   {
      // Get all files ending in `.ts` that are not declarations in the entry point folder or sub-folders. These TS
      // files will be compiled and added to the declaration bundle generated as synthetic wildcard exports.
      tsFilepaths = await getFileList({
         dir: upath.dirname(generateConfig.input),
         includeFile: /^(?!.*\.d\.ts$).*\.ts$/,
         resolve: true,
         walk: generateConfig.tsFileWalk
      });
   }

   // Parse input source file and gather any top level NPM packages that may be referenced.
   const {
      lexerFilepaths,
      localPackageImports,
      packages,
      packageObj,
      success } = await parseFiles(eventbus, generateConfig, compilerOptions, isTSMode);

   if (!success)
   {
      return `error: One or more file parsing errors occurred.`;
   }

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

   // Rewrite `#imports` referenced file paths with the relative path from commonPathFiles.
   for (const [importKey, importPath] of localPackageImports)
   {
      localPackageImports.set(importKey, upath.relative(commonPathFiles, importPath));
   }

   // Get the input DTS entry point; this is without DTS extension change which occurs after compilation.
   const dtsEntryPath = `${compilerOptions.outDir}/${localRelativePath}`;
   const dtsDirectoryPath = compilerOptions.outDir;

   // ---

   // Relative path from current working directory to local common path. Used for filtering diagnostic errors.
   const inputRelativeDir = upath.relative(process.cwd(), commonPathFiles);

   // ----------------------------------------------------------------------------------------------------------------

   const processedConfig = {
      compileFilepaths,
      compilerOptions,
      dtsDirectoryPath,
      dtsEntryPath,
      eventbus,
      generateConfig,
      inputRelativeDir,
      isTSMode,
      lexerFilepaths,
      localPackageImports,
      packages,
      packageObj,
      tsFilepaths,
   };

   // Don't deep freeze `eventbus`.
   deepFreeze(processedConfig, new Set(['eventbus']));

   return processedConfig;
}

/**
 * Resolve local `imports` files from `package.json` substituting the `#imports` alias for the actual path in
 * generated declarations.
 *
 * @param {ProcessedConfig}   processedConfig - Processed config.
 *
 * @returns {import('@rollup/plugin-alias').Alias[]} Resolved local `imports` files for Rollup plugin alias.
 */
function resolveLocalImports(processedConfig)
{
   const { dtsDirectoryPath, localPackageImports } = processedConfig;

   const importsAlias = [];

   for (const [importKey, importPath] of localPackageImports)
   {
      importsAlias.push({
         find: importKey,
         replacement: upath.join(dtsDirectoryPath, upath.trimExt(importPath))
      });
   }

   return importsAlias;
}

/**
 * Attempt to resolve Typescript declarations for any top level exported packages providing a correct alias for Rollup
 * depending on `bundlePackageExports`, `importsExternal`, and `importsResolve` options.
 *
 * Note: This is useful for libraries that re-bundle NPM packages.
 *
 * @param {ProcessedConfig}   processedConfig - Processed config.
 *
 * @returns {import('@rollup/plugin-alias').Alias[]} Resolved local package types for Rollup plugin alias.
 */
function resolvePackageExports(processedConfig)
{
   const { generateConfig, packages } = processedConfig;

   const { isImportsExternalKey, isImportsResolveKey } = resolvePackageImportKeys(processedConfig);

   const packageAlias = [];

   for (const [packageNameOrAlias, packageName] of packages)
   {
      // Is this an imports package alias?
      const isImportsKey = packageNameOrAlias.startsWith('#');

      // Do not resolve / parse package if it is marked as imports external.
      if (isImportsKey && isImportsExternalKey(packageNameOrAlias)) { continue; }

      let resolved = packageNameOrAlias;

      // Match against any imports resolve key regexes. If a match is found then substitute for `packageName`.
      if (isImportsKey && isImportsResolveKey(resolved)) { resolved = packageName; }

      if (generateConfig.bundlePackageExports)
      {
         resolved = parsePackage(resolved, generateConfig);

         if (!resolved)
         {
            logger.warn(
             `[resolvePackageExports]: Could not locate TS declaration for package; '${packageName}'.`);

            continue;
         }
      }

      // If the resolved package is the same as original package name / alias then skip adding to Rollup plugin alias.
      if (packageNameOrAlias === resolved) { continue; }

      packageAlias.push({
         find: packageNameOrAlias,
         replacement: resolved
      });
   }

   return packageAlias;
}

/**
 * Parses the `imports` field of the closest `package.json` from the input source file for import specifier keys that
 * map to packages.
 *
 * @param {ProcessedConfig}   processedConfig - Processed config.
 *
 * @returns {({
 *    isImportsExternalKey: (key: string) => boolean,
 *    isImportsResolveKey: (key: string) => boolean
 * })} Respective functions to test if a given package name / alias is an `imports` key for resolution or marked as
 *     external.
 */
function resolvePackageImportKeys(processedConfig)
{
   const { generateConfig, packageObj } = processedConfig;

   const regexImportsExternalKeys = [];
   const regexImportsResolveKeys = [];

   let importsExternalKeys = new Set();
   let importsResolveKeys = new Set();

   /**
    * Match against any external imports key regexes.
    *
    * @param {string}   key - package alias to test.
    *
    * @returns {boolean} Is an import package alias to mark as external.
    */
   function isImportsExternalKey(key)
   {
      for (const regex of regexImportsExternalKeys)
      {
         if (regex.test(key)) { return true; }
      }

      return false;
   }

   /**
    * Match against any resolve imports key regexes.
    *
    * @param {string}   key - package alias to test.
    *
    * @returns {boolean} Is an import package alias to resolve.
    */
   function isImportsResolveKey(key)
   {
      for (const regex of regexImportsResolveKeys)
      {
         if (regex.test(key)) { return true; }
      }

      return false;
   }

   /* v8 ignore next 5 */ // Sanity check case. A failure would have already occurred in `parseFiles`.
   if (!isObject(packageObj?.imports))
   {
      logger.warn(`[resolvePackageImportsKeys]: Closest 'package.json' to input source file doesn't have 'imports'.`);
      return { isImportsExternalKey, isImportsResolveKey };
   }

   // Collect all relevant `importsExternal` keys.
   if (generateConfig.importsExternal !== void 0)
   {
      importsExternalKeys = new Set(Array.isArray(generateConfig.importsExternal?.importKeys) ?
       generateConfig.importsExternal.importKeys : Object.keys(packageObj.imports));
   }

   // Collect all relevant `importsResolve` keys.
   if (generateConfig.importsResolve !== void 0)
   {
      importsResolveKeys = new Set(Array.isArray(generateConfig.importsResolve?.importKeys) ?
       generateConfig.importsResolve.importKeys : Object.keys(packageObj.imports));
   }

   // Store any imports key lookup failures for later logging.
   const lookupFailureKeys = new Set();

   // Combine external and resolve keys in one Set to perform the lookups once.
   const allImportsKeys = new Set([...importsExternalKeys, ...importsResolveKeys]);

   for (const key of allImportsKeys)
   {
      try
      {
         const importPackage = resolvePkg.imports(packageObj, key)?.[0];

         // Skip all local path mappings for imports and anything that isn't a package.
         if (!isPackage(importPackage))
         {
            logger.warn(`[resolvePackageImportKeys]: Imports specifier does not reference a package '${key}'.`);
            continue;
         }

         const regex = globToRegExp(key);

         if (importsExternalKeys.has(key)) { regexImportsExternalKeys.push(regex); }
         if (importsResolveKeys.has(key)) { regexImportsResolveKeys.push(regex); }
      }
      catch (err)
      {
         lookupFailureKeys.add(key);
      }
   }

   for (const key of lookupFailureKeys)
   {
      logger.warn(`[resolvePackageImportKeys]: Failure to find imports specifier '${key}'.`);
   }

   return { isImportsExternalKey, isImportsResolveKey };
}

/**
 * @type {import('type-fest').TsConfigJson.CompilerOptions}
 */
const s_DEFAULT_TS_GEN_COMPILER_OPTIONS = {
   allowImportingTsExtensions: true,
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
   allowImportingTsExtensions: true,
   allowJs: true,
   checkJs: true,
   declaration: true,
   noEmit: true,
   moduleResolution: 'bundler',
   module: 'es2022',
   target: 'es2022',
   outDir: './.dts'
};

const s_REGEX_EXPORT = /^\s*export/;
const s_REGEX_PACKAGE = /^([a-z0-9-~][a-z0-9-._~]*)(\/[a-z0-9-._~/]*)*/;
const s_REGEX_PACKAGE_SCOPED = /^(@[a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-._~]*)(\/[a-z0-9-._~/]*)*/;

/**
 * @typedef {object} GenerateConfig Data used to generate the bundled TS declaration.
 *
 * @property {string}               input The input entry ESM source path.
 *
 * @property {boolean}              [bundlePackageExports=false] When true attempt to bundle types of top level
 * exported packages. This is useful for re-bundling libraries.
 *
 * @property {boolean}              [checkDefaultPath=false] When true and bundling top level package exports via
 * `bundlePackageExports` check for `index.d.ts` in package root; this is off by default as usually this is indicative
 * of and older package not updated for `exports` in `package.json`.
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
 * @property {(
 *    boolean | import('@typhonjs-build-test/rollup-plugin-pkg-imports').ImportsPluginOptions
 * )} [importsExternal] When defined enables `importsExternal` from the `@typhonjs-build-test/rollup-plugin-pkg-imports`
 * package.
 *
 * @property {(
 *    boolean | import('@typhonjs-build-test/rollup-plugin-pkg-imports').ImportsResolvePluginOptions
 * )} [importsResolve] When defined enables `importsResolve` from the `@typhonjs-build-test/rollup-plugin-pkg-imports`
 * package.
 *
 * @property {import('@typhonjs-utils/logger-color').LogLevel} [logLevel='info'] Defines the logging level.
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
 * @property {Iterable<string>}     [plugins] An iterable list of NPM package names or local source files providing ESM
 * plugins to load for additional file type support. Official 1st party plugins installed will automatically load. Use
 * `plugins` to load any 3rd party plugins.
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
 * @property {boolean | import('prettier').Options} [prettier] When defined as "false" `prettier` is not executed on
 * the bundled declaration output. Otherwise, you may provide a custom `prettier` configuration object.
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
 * @property {string}   [tsconfig] Provide a path to a `tsconfig.json` for custom `compilerOptions` configuration.
 *
 * @property {boolean} [tsDiagnosticExternal=false] By default, all diagnostic errors that are external to the common
 * root path from the `input` source file will be filtered from diagnostic logging. Set to `true` to include all
 * diagnostic errors in logging. If you set an explicit diagnostic filter function via the `tsDiagnosticFilter` this
 * option is ignored.
 *
 * @property {(
 *    (params: { diagnostic: import('typescript').Diagnostic, message?: string }) => boolean
 * )} [tsDiagnosticFilter] Optional filter function to handle diagnostic messages in a similar manner as the `onwarn`
 * Rollup callback. Return `true` to filter the given diagnostic from posting to `console.error` otherwise return false
 * to include.
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
 * @property {boolean}     isTSMode Indicates if the Typescript mode / processing is enabled.
 *
 * @property {string[]}    lexerFilepaths The lexically parsed original file paths connected with the entry point.
 *
 * @property {Map<string, string>} localPackageImports Contains local files referenced by `package.json` `imports`
 * field.
 *
 * @property {Map<string, string>} packages Top level packages exported from entry point. Key is the identifier in
 * source code / may be an `imports` alias / value is the actual package identifier.
 *
 * @property {import('type-fest').PackageJson} packageObj - Closest `package.json` object from input source file.
 *
 * @property {string[]}    tsFilepaths A list of all TS files to add synthetic exports.
 */
