import { fileURLToPath }   from 'node:url';

import { PluginManager }   from '@typhonjs-plugin/manager';
import { getDirList }      from '@typhonjs-utils/file-util';
import upath               from 'upath';

/** @type {import('@typhonjs-plugin/manager').PluginManager} */
const pluginManager = new PluginManager();

const dir = upath.resolve(fileURLToPath(import.meta.url), '../../../../');

const plugins = await getDirList({ dir, includeDir: /^esm-d-ts-plugin/ });

for (const plugin of plugins)
{
   const name = `@typhonjs-build-test/${plugin}`;
   await pluginManager.add({ name });
}

export { pluginManager };
