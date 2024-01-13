# Changelog
## Release 0.2.0-next.4
- Added `@packageDocumentation` comment pass-through to generated DTS when this comment type appears in the main entry
point source file.

## Release 0.2.0-next.3
- Added `@module` comment pass-through to generated DTS when this comment type appears in the main entry point source
file. This is helpful when generating docs from the DTS file.

## Release 0.2.0-next.2
- Added `outputPostprocess` configuration option to separately output postprocessing to an alternate filepath for
easier debugging / comparison.

## Release 0.2.0-next.1
- Introduces optional postprocessing of the generated bundled Typescript declaration.
  - First post processor is for `@inheritDoc` support.

## Release 0.1.1
- Support for `.mjs` source files.
  - Caveat: when using `import types` you must specify the `.mjs` extension like: `@param {import('./AFile.mjs').ASymbol}`

## Release 0.1.0
- Initial beta release
