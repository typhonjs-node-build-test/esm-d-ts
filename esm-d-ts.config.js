/**
 * Generate DTS for generator / transformer exports.
 *
 * When not explicitly settings `output` `esm-d-ts` will automatically configure `output` by changing the extension
 * of the required input path. With the config below output for the bundled declarations are:
 * - `./src/generator/index.d.ts`
 * - `./src/postprocess/index.d.ts`
 * - `./src/transformer/index.d.ts`
 * - `./src/util/index.d.ts`
 *
 * Note: to reference GenerateConfig when installing `esm-d-ts` use:
 * `import('@typhonjs-build-test/esm-d-ts').GenerateConfig)`
 */

/** @type {import('./src/generator').GenerateConfig[]} */
const configs = [
   { input: './src/generator/index.js' },
   { input: './src/postprocess/index.js' },
   { input: './src/transformer/index.js' },
   { input: './src/util/index.js' }
];

export default configs;
