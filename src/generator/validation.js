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

   if (config.replace !== void 0 && !isObject(config.replace))
   {
      Logger.error(`validateConfig error: 'config.replace' must be an object.`);
      result = false;
   }

   // Typescript related configuration options -----------------------------------------------------------------------

   if (config.checkJs !== void 0 && typeof config.checkJs !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.checkJs' must be a boolean.`);
      result = false;
   }

   if (config.filterDiagnostic !== void 0 && typeof config.filterDiagnostic !== 'function')
   {
      Logger.error(`validateConfig error: 'config.filterDiagnostic' must be a function.`);
      result = false;
   }

   if (typeof config.filterExternal !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.filterExternal' must be a boolean.`);
      result = false;
   }

   if (typeof config.logDiagnostic !== 'boolean')
   {
      Logger.error(`validateConfig error: 'config.logDiagnostic' must be a boolean.`);
      result = false;
   }

   if (config.transformers !== void 0 && !isIterable(config.transformers) && typeof config.transformers !== 'function')
   {
      Logger.error(`validateConfig error: 'config.transformers' must be a function or iterable list of functions.`);
      result = false;
   }

   // Rollup related configuration options ---------------------------------------------------------------------------

   if (config.external !== void 0 && typeof config.external !== 'string' && !(config.external instanceof RegExp) &&
    !Array.isArray(config.external) && typeof config.external !== 'function')
   {
      Logger.error(
       `validateConfig error: 'config.external' must be a string, RegExp, array of string / RegExp, or function.`);
      result = false;
   }

   if (config.paths !== void 0 && !isObject(config.paths) && typeof config.paths !== 'function')
   {
      Logger.error(`validateConfig error: 'config.paths' must be an object or function.`);
      result = false;
   }

   if (config.onwarn !== void 0 && typeof config.onwarn !== 'function')
   {
      Logger.error(`validateConfig error: 'config.onwarn' must be a function.`);
      result = false;
   }

   return result;
}
