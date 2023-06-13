// Generate DTS for generator / transformer exports.

// Note: to reference GenerateConfig when installing `esm-d-ts` use:
// `import('@typhonjs-build-test/esm-d-ts').GenerateConfig)`

/** @type {import('./src/generator').GenerateConfig[]} */
const configs = [
   { input: './src/generator/index.js', output: './src/generator/index.d.ts' },
   { input: './src/transformer/index.js', output: './src/transformer/index.d.ts' }
];

export default configs;
