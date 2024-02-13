import { fileURLToPath }         from 'node:url';

import { PluginManager }         from '@typhonjs-plugin/manager';
import {
   getDirList,
   isFile }                      from '@typhonjs-utils/file-util';

import upath                     from 'upath';

import { logger }                from "#util";

import { DTSPluginTypescript }   from './DTSPluginTypescript.js';

/**
 * Provides custom initialization of plugins located in `node_modules/@typhonjs-build-test` organization. Presently,
 * only official first party plugins are supported.
 *
 * `esm-d-ts` plugins receive the following event callbacks in the order that they are fired:
 *
 * - `lifecycle:start` - Before starting either the `checkJS` or `generateDTS` work flow.
 *
 * - `lexer:transform:<FILE_EXTENSION>` - Allows plugins to handle unknown file extensions transforming them into ESM
 *  code that can be lexically analyzed for imports / dependency connection to the main entry point being processed.
 *
 * - `compile:transform` - Provides an opportunity for plugins to transform any files collected for compilation before
 *  invoking the Typescript compiler.
 *
 * - 'compile:diagnostic:filter' - Allows plugins to filter any raised diagnostic warnings from compilation.
 *
 * - `compile:end` - Allows any postprocessing of intermediate declarations generated before bundling of declarations.
 *
 * - `lifecycle:end` - After the work flow has completed.
 */
class DTSPluginManager extends PluginManager
{
   #initialized = false;

   /**
    * Handles deferred plugin loading until after the logger log level has been set for programmatic API.
    *
    * @param {Iterable<string>} externalPlugins - Iterable list of 3rd party plugins to load.
    *
    * @param {boolean} isTSMode - Is Typescript mode enabled.
    *
    * @returns {Promise<void>}
    */
   async initialize(externalPlugins, isTSMode)
   {
      if (this.#initialized) { return; }

      this.#initialized = true;

      // Add Typescript plugin if entry point is a Typescript file.
      if (isTSMode)
      {
         await super.add({
            name: '@typhonjs-build-test/esm-d-ts-plugin-typescript',
            instance: new DTSPluginTypescript()
         });
      }

      const dir = upath.resolve(fileURLToPath(import.meta.url), '../../../../');

      // Only load 1st party plugins when `esm-d-ts` is installed from `node_modules/@typhonjs-build-test`.
      if (upath.dirname(dir) === '@typhonjs-build-test')
      {
         const firstPartyPlugins = await getDirList({ dir, includeDir: /^esm-d-ts-plugin/ });

         for (const plugin of firstPartyPlugins)
         {
            const name = `@typhonjs-build-test/${plugin}`;
            await super.add({ name });
         }
      }

      for (const plugin of externalPlugins)
      {
         // Load from local file.
         if (isFile(plugin))
         {
            const name = upath.basename(plugin);
            await super.add({ name, target: plugin });
         }
         else // Load as NPM package.
         {
            await super.add({ name: plugin });
         }
      }

      const pluginNames = super.getPluginNames();

      if (pluginNames.length) { logger.verbose(`Loading plugins: ${pluginNames.join(', ')}`); }
   }
}

const pluginManager = new DTSPluginManager();

export { pluginManager };
