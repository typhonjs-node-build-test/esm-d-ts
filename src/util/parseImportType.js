import {
   isIterable,
   isObject }  from "@typhonjs-utils/object";

import upath   from 'upath';

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
 * Parses a string for `import types` returning an object with the parts required to perform AST manipulation.
 *
 * If no import type statement detected the result is undefined.
 *
 * @param {*}  type - A type string to parse for import types.
 *
 * @returns {ParsedImportType | undefined} Result of parsed import type or undefined.
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

/**
 * Parses all import type statements from a parsed comment block given a JSDoc tag to parse for the type.
 *
 * @param {object} options - Options.
 *
 * @param {import('comment-parser').Block}   options.block - A parsed comment block.
 *
 * @param {string} options.tag - The JSDoc tag to parse for import types.
 *
 * @param {boolean} [options.first=false] - The JSDoc tag to parse for import types.
 *
 * @returns {ParsedImportType[] | undefined} Resulting parsed import types for the given tag.
 */
export function parseImportTypesFromBlock({ block, tag, first = false })
{
   // The comment block is not valid or there are no tags.
   if (!isObject(block) || !isIterable(block.tags)) { return; }

   if (typeof tag !== 'string') { throw new TypeError(`parseImportTypesFromBlock error: 'tag' is not a string.`); }
   if (typeof first !== 'boolean')
   {
      throw new TypeError(`parseImportTypesFromBlock error: 'first' is not a boolean.`);
   }

   const results = [];

   for (const entry of block.tags)
   {
      if (entry.tag === tag && typeof entry.type === 'string')
      {
         const parsedImport = parseImportType(entry.type);
         if (parsedImport)
         {
            results.push(parsedImport);

            // Handle the case when only the first parsed result is requested.
            if (first) { return results; }
         }
      }
   }

   return results;
}

/**
 * @typedef {object} ParsedImportType Defines the parts of an import type statement.
 *
 * @property {string} identFull Fully qualified symbol including namespace.
 *
 * @property {string} identImport The first part of the imported symbol to synthesize a module import.
 *
 * @property {string} module The module / package imported.
 */
