import path                from 'node:path';
import { pathToFileURL }   from 'node:url';

import { isFile }          from '@typhonjs-utils/file-util';

import {
   isObject,
   isIterable }            from '@typhonjs-utils/object';

import {
   checkDTS,
   generateDTS }           from '../generator/index.js';

import { logger }          from '#util';

/**
 * Invokes checkDTS with the given input / config options.
 *
 * @param {string}   input - Source / input file.
 *
 * @param {object}   opts - CLI options.
 *
 * @returns {Promise<void>}
 */
export async function check(input, opts)
{
   const processedOptions = await processOptions(input, opts);

   if (processedOptions.config)
   {
      if (isIterable(processedOptions.config))
      {
         for (const entry of processedOptions.config)
         {
            await checkDTS(entry);
         }
      }
      else
      {
         await checkDTS(processedOptions.config);
      }
   }
   else
   {
      await checkDTS(processedOptions.options);
   }
}

/**
 * Invokes generateDTS with the given input / config options.
 *
 * @param {string}   input - Source / input file.
 *
 * @param {object}   opts - CLI options.
 *
 * @returns {Promise<void>}
 */
export async function generate(input, opts)
{
   const processedOptions = await processOptions(input, opts);

   if (processedOptions.config)
   {
      if (isIterable(processedOptions.config))
      {
         for (const entry of processedOptions.config)
         {
            await generateDTS(entry);
         }
      }
      else
      {
         await generateDTS(processedOptions.config);
      }
   }
   else
   {
      await generateDTS(processedOptions.options);
   }
}

/**
 * @param {string}   filepath - Filepath of config.
 *
 * @returns {Promise<import('../generate').GenerateConfig | import('../generate').GenerateConfig[]>} Loaded config.
 */
async function loadConfig(filepath)
{
   const module = await import(pathToFileURL(filepath));

   if (module.default === void 0) { exit(`The config does not have a default export: ${filepath}`); }

   // Do some lite error checking on the provided config.
   if (isObject(module.default))
   {
      if (typeof module.default.input !== 'string')
      {
         exit(`The config exported does not have the required 'input' attribute: ${filepath}`);
      }

      if (!isFile(module.default.input))
      {
         exit(`The config 'input' / entry point file does not exist for: ${module.default.input}`);
      }
   }
   else if (isIterable(module.default))
   {
      let i = 0;
      for (const entry of module.default)
      {
         if (!isObject(entry))
         {
            exit(`The config file exports a list, but entry[${i}] is not an object: ${filepath}`);
         }

         if (typeof entry.input !== 'string')
         {
            exit(`The config file exports a list, but entry[${i}] does not have the required 'input' attribute: ${
             filepath}`);
         }

         if (!isFile(entry.input))
         {
            exit(`The config exports a list, but entry[${i}].input / entry point file does not exist for: ${
             entry.input}`);
         }

         i++;
      }
   }
   else
   {
      exit(`The config file default export is not an object or iterable: ${filepath}`);
   }

   return module.default;
}

/**
 * @param {string}   input - Source / input file
 *
 * @param {object}   opts - CLI options.
 *
 * @returns {Promise<ProcessedOptions>} Processed options.
 */
async function processOptions(input, opts)
{
   // Invalid / no options for source file path or config file.
   if (typeof input !== 'string' && opts.config === void 0)
   {
      exit('Invalid options: missing `[input]` and no config file option provided.');
   }

   if (typeof opts?.loglevel === 'string')
   {
      if (!logger.isValidLevel(opts.loglevel))
      {
         exit(`Invalid options: log level '${
            opts.loglevel}' must be 'off', 'fatal', 'error', 'warn', 'info', 'debug', 'verbose', 'trace', or, 'all'.`);
      }

      logger.setLogLevel(opts.loglevel);
   }

   const dirname = path.dirname(process.cwd());

   let config;

   if (opts.config)
   {
      switch (typeof opts.config)
      {
         // Load default config.
         case 'boolean':
            if (!isFile('./esm-d-ts.config.js') && !isFile('./esm-d-ts.config.mjs'))
            {
               exit(`No default config file 'esm-d-ts.config.[m]js' available in: ${dirname}`);
            }

            if (isFile('./esm-d-ts.config.js'))
            {
               logger.verbose(`Loading config from path: './esm-d-ts.config.js'`);
               config = await loadConfig(path.resolve('./esm-d-ts.config.js'));
            }
            else if (isFile('./esm-d-ts.config.mjs'))
            {
               logger.verbose(`Loading config from path: './esm-d-ts.config.mjs'`);
               config = await loadConfig(path.resolve('./esm-d-ts.config.mjs'));
            }
            break;

         // Load specific config.
         case 'string':
         {
            const configPath = path.resolve(opts.config);

            if (!isFile(configPath)) { exit(`No config file available at: ${configPath}`); }

            logger.verbose(`Loading config from path: '${configPath}'`);
            config = await loadConfig(configPath);
            break;
         }
      }

      // Apply any global command line options to overriding config file values.
      if (isIterable(config))
      {
         for (const entry of config)
         {
            if (typeof opts?.check === 'boolean' && opts.check) { entry.tsCheckJs = true; }
            if (typeof opts?.loglevel === 'string') { entry.logLevel = opts.loglevel; }
            if (typeof opts?.tsconfig === 'string' && opts.tsconfig !== '') { entry.tsconfig = opts.tsconfig; }
         }
      }
      else if (isObject(config))
      {
         if (typeof opts?.check === 'boolean' && opts.check) { config.tsCheckJs = true; }
         if (typeof opts?.loglevel === 'string') { config.logLevel = opts.loglevel; }
         if (typeof opts?.tsconfig === 'string' && opts.tsconfig !== '') { config.tsconfig = opts.tsconfig; }
      }
   }
   else
   {
      // Verify `input` file.
      const inputpath = path.resolve(input);
      if (!isFile(inputpath)) { exit(`No input / entry point file exists for: ${input}`); }
   }

   /**
    * Construct command line options configuration; this is used when a config file is not loaded.
    *
    * @type {import('../generate').GenerateConfig}
    */
   const options = { input };

   if (typeof opts?.check === 'boolean' && opts.check) { options.tsCheckJs = true; }
   if (typeof opts?.loglevel === 'string') { options.logLevel = opts.loglevel; }
   if (typeof opts?.output === 'string' && opts.output !== '') { options.output = opts.output; }
   if (typeof opts?.tsconfig === 'string' && opts.tsconfig !== '') { options.tsconfig = opts.tsconfig; }

   return { config, options };
}

/**
 * @param {string} message - A message.
 *
 * @param {boolean} [exit=true] - Invoke `process.exit`.
 */
function exit(message, exit = true)
{
   console.error(`[31m[esm-d-ts] ${message}[0m`);
   if (exit) { process.exit(1); }
}

/**
 * @typedef {object} ProcessedOptions
 *
 * @property {import('../generate').GenerateConfig | import('../generate').GenerateConfig[]} [config] Loaded config(s).
 *
 * @property {object} [options] All GenerateConfig command line options defined.
 */
