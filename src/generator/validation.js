import {
   isIterable,
   isObject }     from '@typhonjs-utils/object';

import fs         from 'fs-extra';
import ts         from 'typescript';

import { Logger } from '#logger';

/**
 * Validates the TS compiler options.
 *
 * @param {import('type-fest').TsConfigJson.CompilerOptions} compilerOptions - The TS compiler options.
 *
 * @returns {ts.CompilerOptions|undefined} The validated compiler options or undefined if failure.
 */
export function validateCompilerOptions(compilerOptions)
{
   // Validate `config.compilerOptions` ------------------------------------------------------------------------------

   // Use the current working directory as the base path.
   const basePath = process.cwd();

   const { options, errors } = ts.convertCompilerOptionsFromJson(compilerOptions, basePath);

   if (errors.length > 0)
   {
      for (const error of errors) { Logger.error(`[TS] ${ts.flattenDiagnosticMessageText(error.messageText, '\n')}`); }
      return void 0;
   }

   return options;
}

/**
 * Validates all config object parameters except `compilerOptions`.
 *
 * @param {import('./index').GenerateConfig} config - A generate config.
 *
 * @returns {boolean} Validation state.
 */
export function validateConfig(config)
{
   let result = true;

   if (typeof config.input !== 'string')
   {
      Logger.error(`validateConfig error: 'config.input' must be a string.`);
      result = false;
   }

   if (!fs.existsSync(config.input))
   {
      Logger.error(`validateConfig error: 'config.input' file does not exist.`);
      result = false;
   }

   if (config.bundlePackageExports !== void 0 && typeof config.bundlePackageExports !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.bundlePackageExports' must be a boolean.`);
      result = false;
   }

   if (config.checkDefaultPath !== void 0 && typeof config.checkDefaultPath !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.checkDefaultPath' must be a boolean.`);
      result = false;
   }

   if (config.conditionExports !== void 0 && !isObject(config.conditionExports))
   {
      Logger.error(`validateConfig error: 'config.conditionExports' must be an object.`);
      result = false;
   }

   if (config.conditionImports !== void 0 && !isObject(config.conditionImports))
   {
      Logger.error(`validateConfig error: 'config.conditionImports' must be an object.`);
      result = false;
   }

   if (config.dtsReplace !== void 0 && !isObject(config.dtsReplace))
   {
      Logger.error(`validateConfig error: 'config.dtsReplace' must be an object.`);
      result = false;
   }

   if (typeof config.filterTags !== 'string' && !isIterable(config.filterTags) && config.filterTags !== false &&
    config.filterTags !== null && config.filterTags !== void 0)
   {
      Logger.error(
       `validateConfig error: 'config.filterTags' must be a string, iterable list of strings, or falsy value.`);

      result = false;
   }

   if (config.importsExternal !== void 0 && !isObject(config.importsExternal) &&
    typeof config.importsExternal !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.importsExternal' must be a boolean or an object.`);
      result = false;
   }

   if (config.importsResolve !== void 0 && !isObject(config.importsResolve) &&
    typeof config.importsResolve !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.importsResolve' must be a boolean or an object.`);
      result = false;
   }

   if (!(config.logLevel in Logger.logLevels))
   {
      Logger.error(
       `validateConfig error: 'config.logLevel' must be 'all', 'verbose', 'info', 'warn', or 'error'; received: '${
         config.logLevel}'`);

      result = false;
   }

   if (typeof config.output !== 'string')
   {
      Logger.error(`validateConfig error: 'config.output' must be a string.`);
      result = false;
   }

   if (config.outputExt !== void 0 && typeof config.outputExt !== 'string')
   {
      Logger.error(`validateConfig error: 'config.outputExt' must be a string.`);
      result = false;
   }

   if (config.outputPostprocess !== void 0 && typeof config.outputPostprocess !== 'string')
   {
      Logger.error(`validateConfig error: 'config.outputPostprocess' must be a string.`);
      result = false;
   }

   if (config.postprocess !== void 0 && !isIterable(config.postprocess))
   {
      Logger.error(`validateConfig error: 'config.postprocess' must be an iterable list of functions.`);
      result = false;
   }

   if (config.prependFiles !== void 0 && !isIterable(config.prependFiles))
   {
      Logger.error(`validateConfig error: 'config.prependFiles' must be an iterable list of strings.`);
      result = false;
   }

   if (config.prependString !== void 0 && !isIterable(config.prependString))
   {
      Logger.error(`validateConfig error: 'config.prependString' must be an iterable list of strings.`);
      result = false;
   }

   if (typeof config.removePrivateStatic !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.removePrivateStatic' must be a boolean.`);
      result = false;
   }

   // Typescript related configuration options -----------------------------------------------------------------------

   if (config.tsCheckJs !== void 0 && typeof config.tsCheckJs !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.tsCheckJs' must be a boolean.`);
      result = false;
   }

   if (config.tsconfig !== void 0 && typeof config.tsconfig !== 'string')
   {
      Logger.error(`validateConfig error: 'config.tsconfig' must be a string.`);
      result = false;
   }

   if (typeof config.tsDiagnosticExternal !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.tsDiagnosticExternal' must be a boolean.`);
      result = false;
   }

   if (config.tsDiagnosticFilter !== void 0 && typeof config.tsDiagnosticFilter !== 'function')
   {
      Logger.error(`validateConfig error: 'config.tsDiagnosticFilter' must be a function.`);
      result = false;
   }

   if (typeof config.tsDiagnosticLog !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.tsDiagnosticLog' must be a boolean.`);
      result = false;
   }

   if (typeof config.tsFileWalk !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.tsFileWalk' must be a boolean.`);
      result = false;
   }

   if (config.tsTransformers !== void 0 && !isIterable(config.tsTransformers) &&
    typeof config.tsTransformers !== 'function')
   {
      Logger.error(`validateConfig error: 'config.tsTransformers' must be a function or iterable list of functions.`);
      result = false;
   }

   // Rollup related configuration options ---------------------------------------------------------------------------

   if (config.rollupExternal !== void 0 && typeof config.rollupExternal !== 'string' &&
    !(config.rollupExternal instanceof RegExp) && !Array.isArray(config.rollupExternal) &&
     typeof config.rollupExternal !== 'function')
   {
      Logger.error(`validateConfig error: 'config.rollupExternal' must be a string, RegExp, array of string / ` +
       `RegExp, or function.`);

      result = false;
   }

   if (config.rollupPaths !== void 0 && !isObject(config.rollupPaths) && typeof config.rollupPaths !== 'function')
   {
      Logger.error(`validateConfig error: 'config.rollupPaths' must be an object or function.`);
      result = false;
   }

   if (config.rollupOnwarn !== void 0 && typeof config.rollupOnwarn !== 'function')
   {
      Logger.error(`validateConfig error: 'config.rollupOnwarn' must be a function.`);
      result = false;
   }

   return result;
}
