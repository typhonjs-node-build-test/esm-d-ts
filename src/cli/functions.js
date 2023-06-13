import fs                  from 'node:fs';
import path                from 'node:path';
import { pathToFileURL }   from 'node:url';

import {
   isObject,
   isIterable }            from '@typhonjs-utils/object';

import { generateDTS }     from '../generator/index.js';

/**
 * Invokes checkJS with the given input / config options.
 *
 * @param {string}   input - Source / input file.
 *
 * @param {object}   opts - CLI options.
 *
 * @returns {Promise<void>}
 */
export async function check(input, opts)
{
   await processOptions(input, opts);
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
      await generateDTS({ input: processedOptions.input, output: processedOptions.output });
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

      if (!fs.existsSync(module.default.input))
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

         if (!fs.existsSync(entry.input))
         {
            exit(`The config exports a list, but entry[${i}].input / entry point file does not exist for: ${
             entry.input}`);
         }

         if (typeof entry.output !== 'string')
         {
            exit(`The config file exports a list, but entry[${i}] does not have the required 'output' attribute: ${
             filepath}`);
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

   const dirname = path.dirname(process.cwd());

   let config;
   let inputpath;

   if (opts.config)
   {
      switch (typeof opts.config)
      {
         // Load default config.
         case 'boolean':
            if (!fs.existsSync('./esm-d-ts.config.js') && !fs.existsSync('./esm-d-ts.config.mjs'))
            {
               exit(`No default config file 'esm-d-ts.config.[m]js' available in: ${dirname}`);
            }

            if (fs.existsSync('./esm-d-ts.config.js'))
            {
               config = await loadConfig(path.resolve('./esm-d-ts.config.js'));
            }
            else if (fs.existsSync('./esm-d-ts.config.mjs'))
            {
               config = await loadConfig(path.resolve('./esm-d-ts.config.mjs'));
            }
            break;

         // Load specific config.
         case 'string':
         {
            const configPath = path.resolve(opts.config);

            if (!fs.existsSync(configPath)) { exit(`No config file available at: ${configPath}`); }

            config = await loadConfig(configPath);
            break;
         }
      }
   }
   else
   {
      // Verify `input` file.
      inputpath = path.resolve(input);
      if (!fs.existsSync(inputpath)) { exit(`No input / entry point file exists for: ${input}`); }
   }

   return { config, output: opts.output, input, inputpath };
}

/**
 * @param {string} message - A message.
 *
 * @param {boolean} [exit=true] - Invoke `process.exit`.
 */
function exit(message, exit = true)
{
   console.error(`[31m[esm-d-ts] ${message}`);
   if (exit) { process.exit(1); }
}

/**
 * @typedef {object} ProcessedOptions
 *
 * @property {import('../generate').GenerateConfig | import('../generate').GenerateConfig[]} [config] Loaded config(s).
 *
 * @property {string} [input] Original input / entry point.
 *
 * @property {string} [inputpath] Fully qualified input / entry point.
 *
 * @property {string} [output] Original output path.
 */
