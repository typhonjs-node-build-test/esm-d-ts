
![@typhonjs-build-test/esm-d-ts](https://i.imgur.com/a8nCg70.jpg)

[![NPM](https://img.shields.io/npm/v/@typhonjs-build-test/esm-d-ts.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-build-test/esm-d-ts)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-node-build-test/esm-d-ts/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/737953117999726592?label=Discord%20-%20TyphonJS&style=plastic)](https://discord.gg/mnbgN8f)

Provides a modern battle tested near zero configuration tool for ESM / ES Module / Javascript developers to generate bundled Typescript 
declarations from ESM source code utilizing typed `JSDoc`. This tooling can be employed to build types for a primary export and one or more 
sub-path [exports](https://nodejs.org/api/packages.html#exports) creating independent _ESM oriented / module_ based declarations 
utilizing import / export semantics. This tooling can be employed by any project, but is particularly useful for 
library authors as there are many additional options covering advanced use cases that library authors may encounter. 
Some of these optional advanced features include support for re-exporting / re-bundling packages w/ TS declarations and 
thorough support for utilizing [imports](https://nodejs.org/api/packages.html#imports) / import conditions in a variety 
of flexible ways.  

## Installation:

It is recommended to install `esm-d-ts` as a developer dependency in `package.json` as follows:
```json
{
  "devDependencies": {
    "esm-d-ts": "^0.0.26"
  }
}
```
Presently the CLI and `esm-d-ts` can not be installed or used globally; this will be addressed in a future update.

## Overview: 

There is a lot to unpack regarding how to set up a modern ESM Node package for efficient distribution that includes
TS declarations. At this time I'll point to the Typescript [JSDoc informational resources](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) 
and the [handbook description](https://www.typescriptlang.org/docs/handbook/esm-node.html#packagejson-exports-imports-and-self-referencing) 
on how to set up `package.json` `exports` with the `types` condition. In time, I will expand the documentation and 
resources available about `esm-d-ts` covering new patterns unlocked from modern use cases combining JSDoc / TS capabilities. If you have questions please open a discussion in the [issue tracker](https://github.com/typhonjs-node-build-test/esm-d-ts/issues).
You may also stop by the [TyphonJS Discord server](https://discord.gg/mnbgN8f) for discussion & support. 

A design goal behind `esm-d-ts` is to provide flexibility and near-zero configuration, so that you may adapt and use 
`esm-d-ts` for a variety of build and usage scenarios. There are four main ways to configure `esm-d-ts`:
- CLI immediate mode.
- CLI w/ configuration file.
- As a rollup plugin (100% zero configuration)
- Programmatically.

The Rollup plugin can be used w/ 100% zero configuration, but the other ways to set up `esm-d-ts` require at minimum 
an `input` source file that should be the entry point for the given main or sub-path export. By default, when only 
providing the `input` entry point the bundled declaration file will be generated next to the `input` source file with 
the same name and `.d.ts` extension. To generate the bundled declaration file at a specific location provide an 
`output` file path w/ extension. All the ways to configure `esm-d-ts` accept the same configuration object. Except for 
the Rollup plugin every way to configure `esm-d-ts` accepts a list of configuration objects allowing you to completely 
build all sub-path exports in one invocation of `esm-d-ts`.

------
## Example use cases:

The following examples demonstrate essential usage patterns. Each example will take into consideration a hypothetical
package that has a primary export and one sub-path export. The resulting `package.json` exports field looks like this:
```json
{
  "exports": {
    ".": {
      "types": "./src/main/index.d.ts",
      "import": "./src/main/index.js"
    },
    "./sub": {
      "types": "./src/sub/index.d.ts",
      "import": "./src/sub/index.js"
    }
  }
}
```

Note: Typescript requires the `types` condition to always be the first entry in a conditional block in `exports`.

------
### CLI

You may use the CLI via the command line or define a NPM script that invokes it. The CLI has two commands `check` and 
`generate`. `generate` has two aliases `gen` & `g`. The `generate` command creates bundled declaration files. The 
`check` command is a convenient way to log diagnostics from the Typescript compiler `checkJs` output that by default is 
filtered to only display messages limited to the scope of the source files referenced from the entry point specified. 

To receive help about the CLI use `esm-d-ts --help`. Please use it to learn about additional CLI options available.

All examples will demonstrate NPM script usage. 

There are two ways to use the CLI. The first is "immediate mode" where you directly supply an input / entry point. 
Presently, only one source file may be specified in "immediate mode". 

```json
{
  "scripts": {
    "types": "esm-d-ts gen src/main/index.js && esm-d-ts gen src/sub/index.js"
  }
}
```

A more convenient way to define a project is through defining a configuration file. You may specify the `--config` or 
alias `-c` to load a default config defined as `./esm-d-ts.config.js` or `./esm-d-ts.config.mjs`. You may also provide 
a specific file path to a config after the `--config` option.

```json
{
  "scripts": {
    "types": "esm-d-ts gen --config"
  }
}
```

The config file should be in ESM format and have a default export that provides one or a list of `GenerateConfig` 
objects. 

```js
/**
 * @type {import('@typhonjs-build-test/esm-d-ts').GenerateConfig[]}
 */
const config = [
   { input: './src/main/index.js' },
   { input: './src/sub/index.js' },
];

export default config; 
```
------

### Programmatic Usage

You may directly import `checkDTS` or `generateDTS`. These are asynchronous functions that can be invoked with top 
level await. 

```js
import { checkDTS, generateDTS } from '@typhonjs-build-test/esm-d-ts';

// Generates TS declaration bundles.
await generateDTS([
   { input: './src/main/index.js' },
   { input: './src/sub/index.js' },
]);

// Log `checkJs` diagnostics. 
await checkDTS([
   { input: './src/main/index.js' },
   { input: './src/sub/index.js' },
]);
```
------

### Rollup Plugin

A Rollup plugin is accessible via `generateDTS.plugin()` and takes the same configuration object as `generateDTS`. When
using Rollup you don't have to specify the `input` or `output` parameters as it will use the Rollup options for `input`
and `file` option for `output`. An example use case in a Rollup configuration object follows:

```js
import { generateDTS }   from '@typhonjs-build-test/esm-d-ts';

// Rollup configuration object which will generate the `dist/index.d.ts` declaration file.
export default [
   {
      input: 'src/main/index.js',
      plugins: [generateDTS.plugin()],
      output: {
         format: 'es',
         file: 'dist/main/index.js'
      }
   },
   {
      input: 'src/sub/index.js',
      plugins: [generateDTS.plugin()],
      output: {
         format: 'es',
         file: 'dist/sub/index.js'
      }
   }
]
```

`esm-d-ts` will generate respective bundled declarations next to the output `file`:
- `dist/main/index.d.ts`
- `dist/sub/index.d.ts`

Presently `esm-d-ts` only handles a single input entry point. A future update may expand this to handle multiple entry 
points. If you need this functionality please open an issue.

There is no `checkDTS` Rollup plugin.

------

## Advanced Configuration

There are several more advanced configuration options and usage scenarios that are not discussed in this `README`. A 
full description of all configuration options will be provided soon. In a couple of weeks I will have finished some 
compelling TypeDoc tooling and will generate API docs for `esm-d-ts` and release an official "beta" release. This will 
make it much easier to discuss options available. This is not a great solution, but you may refer to the [GenerateConfig typedef](https://github.com/typhonjs-node-build-test/esm-d-ts/blob/main/src/generator/index.js#L898-L988)
in the meantime.

`esm-d-ts` allows some rather advanced usage scenarios for library authors as well from handling `imports` in 
`package.json` to further modification of the TS declarations generated through processing the intermediate AST / 
Abstract Syntax Tree data.  

------

## Caveats 

There is not a well-defined resource that pulls together all the concepts employed or available for using JSDoc to 
generate Typescript declarations. `esm-d-ts` has been in development since November 2021. It is completely working and 
used in production for `TyphonJS` packages and releases. 

That being said presently `esm-d-ts` does require a very particular way of linking all types in JSDoc across a project 
requiring explicit use of [import types](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import-types)
for all symbols linked. _Even symbols from the local project_. This likely is a foreign concept to most ESM / JS 
developers used to IDE tooling that analyzes a project and allows local symbols to be referenced directly in `@param` 
JSDoc tags. This will be solved by adding an analysis stage to `esm-d-ts` in the future allowing local symbols to be 
used without `import types`.

The background on the current need for `import types` is that with Typescript you must explicitly import all symbols 
referenced in documentation or source code. Typescript performs "import / export elision" when transpiling TS to JS 
source code removing imports only used in documentation. JSDoc when used in IDEs for ESM / JS development handles any 
project analysis and documentation generation tooling also analyzes a project for local symbols. 

An additional caveat to be aware of is that presently `esm-d-ts` during the generation process creates intermediate TS 
declaration files and by default they are located in the `./.dts` folder. It is recommended to add an exclusion rule 
in a `.gitignore` file for `/.dts`. This also is on the roadmap to provide a completely in-memory generation process. 

------

## Roadmap
- Create an initial processing stage where `esm-d-ts` analyzes all exported symbols of the local code base allowing 
local symbols to be used without `import types`.  


- Provide a way to manage the generation process entirely in memory. Presently the intermediate individual TS 
declarations created in execution are stored in the `./.dts` folder. Add this folder to your `.gitignore`. This is a 
limitation of `rollup-plugin-dts` & the TS compiler API utilized that uses the file system for bundling. I will be 
looking into submitting a PR to `rollup-plugin-dts` to handle virtual bundling.


- Generate source maps for the bundled TS declarations allowing IDEs to not just jump to the declarations, but also 
open linked source code.

------

## Appreciation

I would like to bring awareness to the awesome underlying packages that make `esm-d-ts` possible:

- [es-module-lexer](https://www.npmjs.com/package/es-module-lexer) - [Guy Bedford](https://github.com/guybedford)
- [rollup-plugin-dts](https://www.npmjs.com/package/rollup-plugin-dts) - [Arpad Borsos](https://github.com/Swatinem)
- [resolve.exports](https://www.npmjs.com/package/resolve.exports) - [Luke Edwards](https://github.com/lukeed)
