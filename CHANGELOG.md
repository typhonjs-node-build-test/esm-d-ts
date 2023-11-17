# Changelog
## Release 0.2.0-next.1
- Introduces optional postprocessing of the generated bundled Typescript declaration.
  - First post processor is for `@inheritDoc` support.

## Release 0.1.1
- Support for `.mjs` source files.
  - Caveat: when using `import types` you must specify the `.mjs` extension like: `@param {import('./AFile.mjs').ASymbol}`

## Release 0.1.0
- Initial beta release
