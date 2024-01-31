import upath from 'upath';

/**
 * Matches named import types; IE `import('./types').Value`. It is lenient and allows the import to be enclosed
 * in `()` which helps for `checkJs` support / prevents TS from choking as import types in `@implements` tags is not
 * supported by TS.
 *
 * Capture group `1`: module path.
 * Capture group `2`: top level import identifier.
 * Optional capture group `3`: remainder of potential namespaced symbol.
 *
 * @type {RegExp}
 */
export const regexImportType = /import\(['"]([^'"]+)['"]\)\.([^.\s]+?)(?:\.([^)\s]+?))?(?=\)?$)/;

/**
 * Parses a `type` string for `import types` returning an object with the parts required to perform AST manipulation.
 *
 * The resulting object contains:
 * - `identFull` - Fully qualified symbol.
 * - `identImport` - The first part of the imported symbol.
 * - `module` - The module / package imported.
 *
 * If no import type statement detected the result is undefined.
 *
 * @param {*}  type - A type string to parse for import types.
 *
 * @returns {{ identFull: string, identImport: string, module: string } | undefined} Result of parsed import type or
 *          undefined.
 */
export function parseImportType(type)
{
   if (typeof type !== 'string') { return; }

   const match = regexImportType.exec(type);

   if (match)
   {
      // Remove any extension as `Bundler` module resolution is used.
      const module = upath.trimExt(match[1].replace(/\.d\.ts$/, ''));

      // This is the main imported identifier / symbol.
      const identImport = match[2];

      // Captures any additional extended symbol; IE a namespaced identifier.
      const extended = match[3] ?? void 0;

      // Constructs the fully qualified identifier.
      const identFull = extended ? `${identImport}.${extended}` : identImport;

      return {
         identFull,
         identImport,
         module
      };
   }
}
