# esm-d-ts
[![NPM](https://img.shields.io/npm/v/@typhonjs-build-test/esm-d-ts.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-build-test/esm-d-ts)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-node-build-test/esm-d-ts/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/737953117999726592?label=Discord%20-%20TyphonJS&style=plastic)](https://discord.gg/mnbgN8f)

Generates a bundled Typescript declaration file from ESM source. Additionally, custom transformers can be enabled to 
manipulate the output declarations.

Basic usage is below:
```js
import { generateDTS }   from '@typhonjs-build-test/esm-d-ts';

await generateDTS({
   input: './src/index.js',
   output: './types/index.d.ts'
});
```

You can also invoke the module via Node eval in package.json as an NPM script:
```json
scripts: {
   "types": "node -e \"import('@typhonjs-build-test/esm-d-ts').then(module => { module.generateDTS({ input: './src/index.js', output: './types/index.d.ts' }) });\""
}
```

A Rollup plugin is accessible via `generateDTS.plugin()` and takes the same configuration object as `generateDTS`. When
using Rollup you don't have to specify the `input` or `output` parameters as it will use the Rollup options for `input`
and `file` option for `output`. An example use case in a Rollup configuration object follows:
```js
import { generateDTS }   from '@typhonjs-build-test/esm-d-ts';

// Rollup configuration object which will generate the `dist/index.d.ts` declaration file.
export default {
   input: 'src/index.js',
   plugins: [generateDTS.plugin()],
   output: {
      format: 'es',
      file: 'dist/index.js'
   }
}
```

Presently `esm-d-ts` only handles a single input entry point. A future update may expand this to handle multiple entry 
points. If you need this functionality please open an issue.

There are more options available and a full description will be provided soon.

Note: When re-bundling packages with the `bundlePackageExports` option in creating an integrated library top-level 
re-exporting of NPM modules that provide TS declarations are added to the public API of declarations. 

For questions in the meantime please join the TyphonJS Discord server to discuss any concerns on usage.

## TODO
- Provide a way to manage the generation process entirely in memory. Presently the intermediate individual TS 
declarations created in execution are stored in the `./.dts` folder. Add this folder to your `.gitignore`. This is a 
limitation of `rollup-plugin-dts` & the TS compiler API utilized that uses the file system for bundling.

- Potentially support multiple input entry points.

- Add configurable logging.
