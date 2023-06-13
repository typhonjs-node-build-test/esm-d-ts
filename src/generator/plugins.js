import {
   isIterable,
   isObject }        from '@typhonjs-utils/object';

import upath         from 'upath';

// The following are internal Rollup plugin implementations. ---------------------------------------------------------

/**
 * Provides a Rollup plugin generating the declaration after the bundle has been written.
 *
 * @param {function(import('./index.js').GenerateConfig): Promise<void>} generateDTS - Generation function.
 *
 * @returns {(options?: import('./index.js').GeneratePluginConfig) => import('rollup').Plugin} The Rollup plugin.
 */
export function generateDTSPlugin(generateDTS)
{
   return function(options)
   {
      let rollupOptionInput;
      let rollupOptionFile;

      let validRollupOptions = true;

      /**
       * Make a shallow copy as various top level attributes may be automatically set.
       *
       * @type {import('./index.js').GenerateConfig}
       */
      const config = Object.assign({ input: void 0 }, options);

      return {
         name: '@typhonjs-build-test/esm-d-ts/generate',

         /**
          * @param {import('rollup').InputOptions}   options - Rollup input options.
          */
         options(options)
         {
            rollupOptionInput = options.input;

            if (typeof rollupOptionInput !== 'string')
            {
               console.error(`esm-d-ts generateDTS.plugin error: Rollup 'input' option is not a string.`);
               validRollupOptions = false;
            }

            // Examine configured Rollup plugins and find either `@typhonjs-build-test/rollup-plugin-pkg-imports`
            // plugins storing the options in the configuration for use in generateDTS.
            if (isIterable(options.plugins))
            {
               for (const plugin of options.plugins)
               {
                  if (isObject(plugin))
                  {
                     if (config.importsExternalOptions === void 0 &&
                      plugin?.name === '@typhonjs-build-test/rollup-plugin-pkg-imports/importsExternal')
                     {
                        config.importsExternalOptions = isObject(plugin.importsPluginOptions) ?
                         plugin.importsPluginOptions : {};
                     }

                     if (config.importsResolveOptions === void 0 &&
                      plugin?.name === '@typhonjs-build-test/rollup-plugin-pkg-imports/importsResolve')
                     {
                        config.importsResolveOptions = isObject(plugin.importsPluginOptions) ?
                         plugin.importsPluginOptions : {};
                     }
                  }
               }
            }
         },

         writeBundle:
         {
            order: 'pre',
            handler({ file })
            {
               rollupOptionFile = file;

               if (typeof rollupOptionFile !== 'string')
               {
                  console.error(`esm-d-ts generateDTS.plugin error: Rollup 'file' option is not a string.`);
                  validRollupOptions = false;
               }
            }
         },

         closeBundle:
         {
            sequential: true,
            order: 'post',
            async handler()
            {
               // Skip processing if stored Rollup options are not valid.
               if (!validRollupOptions) { return; }

               const outputExt = typeof config.outputExt === 'string' ? config.outputExt : '.d.ts';

               if (typeof config.input !== 'string') { config.input = rollupOptionInput; }
               if (typeof config.output !== 'string') { config.output = upath.changeExt(rollupOptionFile, outputExt); }

               return generateDTS(config);
            }
         }
      };
   };
}

/**
 * Performs a naive string replacement on the bundled TS declaration. Be careful! Can't use `@rollup/plugin-replace` as
 * it only operates on Javascript code.
 *
 * TODO: Consider writing a more comprehensive replacement implementation using TS AST!
 *
 * @param {Record<string, string>} replace - The replacement configuration object.
 *
 * @returns {import('rollup').Plugin} The replace Rollup plugin.
 */
export function naiveReplace(replace)
{
   return {
      name: '@typhonjs-build-test/esm-d-ts/replace',

      renderChunk:
      {
         order: 'post',

         /**
          * @param {string}   code - Chunk code.
          *
          * @returns {{code, map: null}} Updated chunk.
          */
         handler(code)
         {
            let updatedCode = code;

            for (const [search, replacement] of Object.entries(replace))
            {
               const regex = new RegExp(search, 'g');
               updatedCode = updatedCode.replace(regex, replacement);
            }

            return { code: updatedCode, map: null };
         }
      }
   };
}
