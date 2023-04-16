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
   main: './src/index.js',
   output: './types/index.d.ts'
});
```

You can also invoke the module via Node eval in package.json as an NPM script:
```
scripts: {
   "types": "node -e \"import('@typhonjs-build-test/esm-d-ts').then(module => { module.generateDTS({ main: './src/index.js', output: './types/index.d.ts' }) });\""
}
```

There are more options available. Note: top-level re-exporting of NPM modules that provide TS declarations are added to the public API of declarations. For questions in the
meantime please join the TyphonJS Discord server to discuss any concerns on usage.

## TODO
- Provide a way to manage the generation process entirely in memory. Presently the intermediate individual TS 
declarations created in execution are stored in the `./.dts` folder. Add this folder to your `.gitignore`. This is a 
limitation of `rollup-plugin-dts` & the TS compiler API utilized that uses the file system for bundling.
