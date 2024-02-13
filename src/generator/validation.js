import { isFile } from '@typhonjs-utils/file-util';

import {
   isIterable,
   isObject }     from '@typhonjs-utils/object';

import ts         from 'typescript';

import { logger } from '#util';

/**
 * Defines valid JS source extensions.
 *
 * @type {RegExp}
 */
export const regexJSExt = /\.(m?js)$/;

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
      for (const error of errors) { logger.error(`[TS] ${ts.flattenDiagnosticMessageText(error.messageText, '\n')}`); }
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
      logger.error(`validateConfig error: 'config.input' must be a string.`);
      result = false;
   }

   if (!isFile(config.input))
   {
      logger.error(`validateConfig error: 'config.input' file does not exist.`);
      result = false;
   }

   if (config.bundlePackageExports !== void 0 && typeof config.bundlePackageExports !== 'boolean')
   {
      logger.error(`validateConfig error: 'config.bundlePackageExports' must be a boolean.`);
      result = false;
   }

   if (config.checkDefaultPath !== void 0 && typeof config.checkDefaultPath !== 'boolean')
   {
      logger.error(`validateConfig error: 'config.checkDefaultPath' must be a boolean.`);
      result = false;
   }

   if (config.conditionExports !== void 0 && !isObject(config.conditionExports))
   {
      logger.error(`validateConfig error: 'config.conditionExports' must be an object.`);
      result = false;
   }

   if (config.conditionImports !== void 0 && !isObject(config.conditionImports))
   {
      logger.error(`validateConfig error: 'config.conditionImports' must be an object.`);
      result = false;
   }

   if (config.dtsReplace !== void 0 && !isObject(config.dtsReplace))
   {
      logger.error(`validateConfig error: 'config.dtsReplace' must be an object.`);
      result = false;
   }

   if (typeof config.filterTags !== 'string' && !isIterable(config.filterTags) && config.filterTags !== false &&
    config.filterTags !== null && config.filterTags !== void 0)
   {
      logger.error(
       `validateConfig error: 'config.filterTags' must be a string, iterable list of strings, or falsy value.`);

      result = false;
   }

   if (config.importsExternal !== void 0 && !isObject(config.importsExternal) &&
    typeof config.importsExternal !== 'boolean')
   {
      logger.error(`validateConfig error: 'config.importsExternal' must be a boolean or an object.`);
      result = false;
   }

   if (config.importsResolve !== void 0 && !isObject(config.importsResolve) &&
    typeof config.importsResolve !== 'boolean')
   {
      logger.error(`validateConfig error: 'config.importsResolve' must be a boolean or an object.`);
      result = false;
   }

   if (!logger.isValidLevel(config.logLevel))
   {
      logger.error(`validateConfig error: 'config.logLevel' must be 'off', 'fatal', 'error', 'warn', 'info', ` +
       `'verbose', 'debug', 'trace', or 'all'; received: '${config.logLevel}'`);

      result = false;
   }

   if (typeof config.output !== 'string')
   {
      logger.error(`validateConfig error: 'config.output' must be a string.`);
      result = false;
   }

   if (config.outputExt !== void 0 && typeof config.outputExt !== 'string')
   {
      logger.error(`validateConfig error: 'config.outputExt' must be a string.`);
      result = false;
   }

   if (config.outputGraph !== void 0 && typeof config.outputGraph !== 'string')
   {
      logger.error(`validateConfig error: 'config.outputGraph' must be a string.`);
      result = false;
   }

   if (config.outputGraphIndentation !== void 0 && typeof config.outputGraphIndentation !== 'number')
   {
      logger.error(`validateConfig error: 'config.outputGraphIndentation' must be a number.`);
      result = false;
   }

   if (config.outputPostprocess !== void 0 && typeof config.outputPostprocess !== 'string')
   {
      logger.error(`validateConfig error: 'config.outputPostprocess' must be a string.`);
      result = false;
   }

   if (config.postprocess !== void 0 && !isIterable(config.postprocess))
   {
      logger.error(`validateConfig error: 'config.postprocess' must be an iterable list of functions.`);
      result = false;
   }

   if (config.plugins !== void 0 && !isIterable(config.plugins))
   {
      logger.error(
       `validateConfig error: 'config.plugins' must be an iterable list of 3rd party NPM packages to load as plugins.`);
      result = false;
   }

   if (config.prependFiles !== void 0 && !isIterable(config.prependFiles))
   {
      logger.error(`validateConfig error: 'config.prependFiles' must be an iterable list of strings.`);
      result = false;
   }

   if (config.prependString !== void 0 && !isIterable(config.prependString))
   {
      logger.error(`validateConfig error: 'config.prependString' must be an iterable list of strings.`);
      result = false;
   }

   if (config.prettier !== void 0 && typeof config.prettier !== 'boolean' && !isObject(config.prettier))
   {
      logger.error(`validateConfig error: 'config.prettier' must be a boolean or 'prettier' configuration object.`);
      result = false;
  }

   if (typeof config.removePrivateStatic !== 'boolean')
   {
      logger.error(`validateConfig error: 'config.removePrivateStatic' must be a boolean.`);
      result = false;
   }

   // Typescript related configuration options -----------------------------------------------------------------------

   if (config.tsCheckJs !== void 0 && typeof config.tsCheckJs !== 'boolean')
   {
      logger.error(`validateConfig error: 'config.tsCheckJs' must be a boolean.`);
      result = false;
   }

   if (config.tsconfig !== void 0 && typeof config.tsconfig !== 'string')
   {
      logger.error(`validateConfig error: 'config.tsconfig' must be a string.`);
      result = false;
   }

   if (typeof config.tsDiagnosticExternal !== 'boolean')
   {
      logger.error(`validateConfig error: 'config.tsDiagnosticExternal' must be a boolean.`);
      result = false;
   }

   if (config.tsDiagnosticFilter !== void 0 && typeof config.tsDiagnosticFilter !== 'function')
   {
      logger.error(`validateConfig error: 'config.tsDiagnosticFilter' must be a function.`);
      result = false;
   }

   if (typeof config.tsDiagnosticLog !== 'boolean')
   {
      logger.error(`validateConfig error: 'config.tsDiagnosticLog' must be a boolean.`);
      result = false;
   }

   if (typeof config.tsFileWalk !== 'boolean')
   {
      logger.error(`validateConfig error: 'config.tsFileWalk' must be a boolean.`);
      result = false;
   }

   if (config.tsTransformers !== void 0 && !isIterable(config.tsTransformers) &&
    typeof config.tsTransformers !== 'function')
   {
      logger.error(`validateConfig error: 'config.tsTransformers' must be a function or iterable list of functions.`);
      result = false;
   }

   // Rollup related configuration options ---------------------------------------------------------------------------

   if (config.rollupExternal !== void 0 && typeof config.rollupExternal !== 'string' &&
    !(config.rollupExternal instanceof RegExp) && !Array.isArray(config.rollupExternal) &&
     typeof config.rollupExternal !== 'function')
   {
      logger.error(`validateConfig error: 'config.rollupExternal' must be a string, RegExp, array of string / ` +
       `RegExp, or function.`);

      result = false;
   }

   if (config.rollupPaths !== void 0 && !isObject(config.rollupPaths) && typeof config.rollupPaths !== 'function')
   {
      logger.error(`validateConfig error: 'config.rollupPaths' must be an object or function.`);
      result = false;
   }

   if (config.rollupOnwarn !== void 0 && typeof config.rollupOnwarn !== 'function')
   {
      logger.error(`validateConfig error: 'config.rollupOnwarn' must be a function.`);
      result = false;
   }

   return result;
}
