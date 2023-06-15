import {
   isIterable,
   isObject }     from '@typhonjs-utils/object';

import fs         from 'fs-extra';
import ts         from 'typescript';

import { Logger } from './logger.js';

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

   if (config.dtsReplace !== void 0 && !isObject(config.dtsReplace))
   {
      Logger.error(`validateConfig error: 'config.dtsReplace' must be an object.`);
      result = false;
   }

   if (config.exportCondition !== void 0 && !isObject(config.exportCondition))
   {
      Logger.error(`validateConfig error: 'config.exportCondition' must be an object.`);
      result = false;
   }

   if (typeof config.filterTags !== 'string' && !isIterable(config.filterTags) && config.filterTags !== false &&
    config.filterTags !== null && config.filterTags !== void 0)
   {
      Logger.error(
       `validateConfig error: 'config.filterTags' must be a string, iterable list of strings, or falsy value.`);

      result = false;
   }

   if (config.importsExternalOptions !== void 0 && !isObject(config.importsExternalOptions))
   {
      Logger.error(`validateConfig error: 'config.importsExternalOptions' must be an object.`);
      result = false;
   }

   if (config.importsResolveOptions !== void 0 && !isObject(config.importsResolveOptions))
   {
      Logger.error(`validateConfig error: 'config.importsResolveOptions' must be an object.`);
      result = false;
   }

   if (config.logLevel !== 'all' && config.logLevel !== 'error' && config.logLevel !== 'warn')
   {
      Logger.error(
       `validateConfig error: 'config.logLevel' must be one of the following strings: 'all', 'error', or 'warn'.`);
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
