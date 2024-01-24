import { fileURLToPath }   from 'node:url';

import { PluginManager }   from '@typhonjs-plugin/manager';
import { getDirList }      from '@typhonjs-utils/file-util';
import upath               from 'upath';

import { logger }          from "#util";

class DTSPluginManager extends PluginManager
{
   #initialized = false;

   /**
    * Handles deferred plugin loading until after the logger log level has been set for programmatic API.
    *
    * @returns {Promise<void>}
    */
   async initialize()
   {
      if (this.#initialized) { return; }

      this.#initialized = true;

      const dir = upath.resolve(fileURLToPath(import.meta.url), '../../../../');

      const plugins = await getDirList({ dir, includeDir: /^esm-d-ts-plugin/ });

      for (const plugin of plugins)
      {
         const name = `@typhonjs-build-test/${plugin}`;
         await super.add({ name });
      }

      const pluginNames = super.getPluginNames();
      if (pluginNames.length) { logger.verbose(`Loading plugins: ${pluginNames.join(', ')}`); }
   }
}

const pluginManager = new DTSPluginManager();

export { pluginManager };
