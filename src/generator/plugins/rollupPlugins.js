import {
   isIterable,
   isObject }        from '@typhonjs-utils/object';

import upath         from 'upath';

// The following are internal Rollup plugin implementations. ---------------------------------------------------------

/**
 * Provides a Rollup plugin generating the declaration after the bundle has been written.
 *
 * @param {function(import('../types').GenerateConfig): Promise<void>} generateDTS - Generation function.
 *
 * @returns {(options?: Partial<import('../types').GenerateConfig>) => import('rollup').Plugin<unknown>} The Rollup
 *          plugin.
 */
export function generateDTSPlugin(generateDTS)
{
   return function(options)
   {
      let rollupOptionExternal;
      let rollupOptionFile;
      let rollupOptionInput;
      let rollupOptionOnwarn;
      let rollupOptionPaths;

      let validRollupOptions = true;

      /**
       * Make a shallow copy as various top level attributes may be automatically set.
       *
       * @type {import('../types').GenerateConfig}
       */
      const config = Object.assign({ input: void 0 }, options);

      return {
         name: '@typhonjs-build-test/esm-d-ts/generate',

         /**
          * @param {import('rollup').InputOptions}   options - Rollup input options.
          */
         options(options)
         {
            rollupOptionExternal = options.external;
            rollupOptionInput = options.input;
            rollupOptionOnwarn = options.onwarn;

            if (typeof rollupOptionInput !== 'string')
            {
               console.error(`[esm-d-ts] generateDTS.plugin error: Rollup 'input' option is not a string.`);
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
                     if (config.importsExternal === void 0 &&
                      plugin?.name === '@typhonjs-build-test/rollup-plugin-pkg-imports/importsExternal')
                     {
                        config.importsExternal = isObject(plugin.importsPluginOptions) ?
                         plugin.importsPluginOptions : {};
                     }

                     if (config.importsLocal === void 0 &&
                      plugin?.name === '@typhonjs-build-test/rollup-plugin-pkg-imports/importsLocal')
                     {
                        config.importsLocal = isObject(plugin.importsPluginOptions) ?
                         plugin.importsPluginOptions : {};
                     }

                     if (config.importsResolve === void 0 &&
                      plugin?.name === '@typhonjs-build-test/rollup-plugin-pkg-imports/importsResolve')
                     {
                        config.importsResolve = isObject(plugin.importsPluginOptions) ?
                         plugin.importsPluginOptions : {};
                     }
                  }
               }
            }
         },

         writeBundle:
         {
            order: 'pre',

            /**
             * @param {import('rollup').OutputOptions}   options - Rollup output options.
             */
            handler(options)
            {
               rollupOptionFile = options.file;
               rollupOptionPaths = options.paths;

               /* v8 ignore next 5 */ // Rollup throws an error when `options.file` is bad before reaching this point.
               if (typeof rollupOptionFile !== 'string')
               {
                  console.error(`[esm-d-ts] generateDTS.plugin error: Rollup 'file' option is not a string.`);
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
               if (!validRollupOptions || !rollupOptionFile) { return; }

               const outputExt = typeof config.outputExt === 'string' ? config.outputExt : '.d.ts';

               // Set values from Rollup options if not defined in GenerateConfig.

               if (typeof config.input !== 'string') { config.input = rollupOptionInput; }

               if (typeof config.output !== 'string') { config.output = upath.changeExt(rollupOptionFile, outputExt); }

               if (config.rollupExternal === void 0 && rollupOptionExternal)
               {
                  config.rollupExternal = rollupOptionExternal;
               }

               if (typeof config.rollupOnwarn !== 'function' && rollupOptionOnwarn)
               {
                  config.rollupOnwarn = rollupOptionOnwarn;
               }

               if (config.rollupPaths === void 0 && rollupOptionPaths) { config.rollupPaths = rollupOptionPaths; }

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
               const regex = new RegExp(search, 'gm');
               updatedCode = updatedCode.replace(regex, replacement);
            }

            return { code: updatedCode, map: null };
         }
      }
   };
}

/**
 * A Rollup plugin to relax "conflicting namespaces" for `.d.ts` bundling.
 *
 * @returns {import('rollup').Plugin} The Rollup plugin.
 */
export function relaxNamespaceConflict()
{
   /**
    * Reused Set tracking top level namespace names in the `transform` callback.
    *
    * @type {Set<string>}
    */
   const nameSet = new Set();

   /**
    * Stores the modified / transformed namespace name -> original name.
    *
    * @type {Map<string, string>}
    */
   const transformMap = new Map();

   /**
    * An incrementing counter as namespaces are transformed.
    *
    * @type {number}
    */
   let counter = 1; // A counter for unique numbering.

   return /** @type {import('rollup').Plugin} */ {
      name: 'relax-namespace-conflict',

      /**
       * During the `transform` phase (pre) parse code for namespaces transforming to unique names.
       */
      transform: {
         order: 'pre',

         handler(code)
         {
            parseTopLevelNamespaces(code, nameSet);

            if (nameSet.size)
            {
               // Replace all top level namespace names with a valid / unique identifier.
               for (const name of nameSet)
               {
                  const modName = `___transformed_namespace___${name}_${counter++}`;
                  code = code.replaceAll(name, modName);
                  transformMap.set(modName, name);
               }
            }

            return code;
         }
      },

      /**
       * During the `generateBundle` phase (post) convert back transformed namespace names carefully handling export
       * statements / de-duping.
       */
      generateBundle: {
         order: 'post',

         handler(options, bundle)
         {
            // Early out nothing to transform.
            if (!transformMap.size) { return; }

            for (const key in bundle)
            {
               const chunk = bundle[key];
               if (typeof chunk?.code !== 'string') { continue; }

               const exportsSet = new Set(Array.isArray(chunk.exports) ? chunk.exports : []);

               for (const modName of transformMap.keys())
               {
                  const name = transformMap.get(modName);
                  if (exportsSet.has(modName))
                  {
                     const exportsHasOriginalName = exportsSet.has(name);

                     const regex = new RegExp(`(?<=export\\s*{[^}]*?)\\s*${modName}\\s*(,\\s*|(?=}|$))`, 'gm');

                     // If original name is in the exports set then do not add it to the export statement.
                     chunk.code = chunk.code.replaceAll(regex, exportsHasOriginalName ? '' : `, ${name}`);

                     exportsSet.delete(modName);

                     // Add the original / replaced name to the exports set.
                     if (!exportsHasOriginalName) { exportsSet.add(name); }
                  }

                  // Substitute all transformed namespace names to the original outside of export statements.
                  const regex = new RegExp(`\\b${modName}\\b(?![^]*?export\\s*{[^}]*${modName}[^}]*})`, 'g');
                  chunk.code = chunk.code.replaceAll(regex, name);
               }

               // Remove leading / trailing commas and extra whitespace.
               chunk.code = chunk.code.replace(/export\s*{([^}]*)}/g, (_, content) =>
               {
                  return `export { ${content.split(',').map((item) => item.trim()).filter(Boolean).join(', ')} }`;
               });
            }
         }
      }
   };
}

// Internal implementation -------------------------------------------------------------------------------------------

/**
 * Parses various permutations of how namespaces are defined in Typescript source files.
 *
 * @type {RegExp}
 */
const namespaceRegex = /^\s*(export\s+declare|declare|export)\s+namespace\s+(?<NAME>[a-zA-Z_$][\w$]*)\s*(?={|;|$)/gm;

/**
 * @param {string}   code - Declaration file to parse.
 *
 * @param {Set<string>} nameSet - Reused Set to track namespace names.
 */
function parseTopLevelNamespaces(code, nameSet)
{
   nameSet.clear();

   let depth = 0; // Tracks brace depth.

   let match;
   let lastIndex = 0; // Tracks last processed position.

   // Iterate through regex matches.
   while ((match = namespaceRegex.exec(code)) !== null)
   {
      const matchIndex = match.index;

      // Update brace depth from the last processed position to the current match.
      for (let i = lastIndex; i < matchIndex; i++)
      {
         switch (code[i])
         {
            case '{':
               depth++;
               break;
            case '}':
               depth--;
               break;
         }
      }

      lastIndex = matchIndex;

      // Only add top-level namespaces.
      if (depth === 0) { nameSet.add(match.groups.NAME); }
   }
}
