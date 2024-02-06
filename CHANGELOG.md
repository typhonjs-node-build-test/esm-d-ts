# Changelog
## Release 0.3.0
- Added plugin support for alternate file formats that support ES Modules. The first plugin available adds support for
  ESM Svelte components (`.svelte` files). For more information on ESM Svelte component support please see:
  [@typhonjs-build-test/esm-d-ts-plugin-svelte](https://www.npmjs.com/package/@typhonjs-build-test/esm-d-ts-plugin-svelte).
  Eventually, the plugin system may be opened to 3rd party extensions along with additional 1st party support for
  alternate file formats / frameworks that are ESM compatible. Presently, compatible 1st party plugins simply need to be
  installed as additional developer dependencies and load automatically.

## Release 0.2.2
- Added a TS AST transformer to support import types in `@implements` JSDoc tags. This allows you to reference
an interface from a class and have it properly converted to `implements <INTERFACE>` in the declarations generated.
- Added `transformer` "meta-transformer" to reduce the boilerplate of creating custom TS AST transformers.

## Release 0.2.1
- Added a new internal AST transformer that corrects the output of the TS compiler for setter accessor parameter names.
  The TS compiler for ESM will rename setter accessor parameter names to `arg` regardless of the value set in the source
  file. If there is a JSDoc comment associated with a setter the first `@param` tag name will be set to the AST node
  param name. Downstream tooling such as TypeDoc `0.25.7+` validates comment / `@param` name against the type declaration
  name; this change fixes that mismatch.

## Release 0.2.0
- Added `@module` / `@packageDocumentation` comment pass-through to generated DTS when this comment type appears in the main entry point source
file. This is helpful when generating docs from the DTS file.

- Introduces optional postprocessing of the generated bundled Typescript declaration.
  - First post processor is for `@inheritDoc` support.

- Added `outputPostprocess` configuration option to separately output postprocessing to an alternate filepath for
  easier debugging / comparison.

## Release 0.1.1
- Support for `.mjs` source files.
  - Caveat: when using `import types` you must specify the `.mjs` extension like: `@param {import('./AFile.mjs').ASymbol}`

## Release 0.1.0
- Initial beta release
