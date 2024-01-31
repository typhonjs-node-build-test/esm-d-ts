import * as _typhonjs_utils_logger_color from '@typhonjs-utils/logger-color';

/**
 * Provides a ColorLogger instance accessible across the package.
 *
 * @type {import('@typhonjs-utils/logger-color').ColorLogger}
 */
declare const logger: _typhonjs_utils_logger_color.ColorLogger;

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
declare function parseImportType(type: any):
  | {
      identFull: string;
      identImport: string;
      module: string;
    }
  | undefined;
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
declare const regexImportType: RegExp;

export { logger, parseImportType, regexImportType };
