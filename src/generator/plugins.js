import upath from 'upath';

// The following are internal Rollup plugin implementations. ---------------------------------------------------------

/**
 * Provides a Rollup plugin generating the declaration sequentially after the bundle has been written.
 *
 * @param {Function} generateDTS - Generation configuration object.
 *
 * @returns {(config: GeneratePluginConfig) => import('rollup').Plugin} The Rollup plugin.
 */
export function generateDTSPlugin(generateDTS)
{
   return function(config)
   {
      let input;
      let validInput = true;

      return {
         name: 'esm-d-ts',

         /**
          * @param {import('rollup').InputOptions}   options - Rollup input options.
          */
         options(options)
         {
            input = options.input;

            if (typeof input !== 'string')
            {
               console.error(`esm-d-ts generateDTS.plugin error: Rollup input options 'input' is not a string.`);
               validInput = false;
            }
         },

         writeBundle:
         {
            sequential: true,
            order: 'post',
            async handler({ file })
            {
               // Skip processing if the input is not valid.
               if (!validInput) { return; }

               const outputExt = typeof config.outputExt === 'string' ? config.outputExt : '.d.ts';

               if (config.input !== 'string') { config.input = input; }
               if (config.output !== 'string') { config.output = upath.changeExt(file, outputExt); }

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
      name: 'esm-d-ts-replace',

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
