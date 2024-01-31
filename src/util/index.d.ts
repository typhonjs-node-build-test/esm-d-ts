import * as _typhonjs_utils_logger_color from '@typhonjs-utils/logger-color';
import * as comment_parser from 'comment-parser';

/**
 * Provides a ColorLogger instance accessible across the package.
 *
 * @type {import('@typhonjs-utils/logger-color').ColorLogger}
 */
declare const logger: _typhonjs_utils_logger_color.ColorLogger;

/**
 * Parses a string for `import types` returning an object with the parts required to perform AST manipulation.
 *
 * If no import type statement detected the result is undefined.
 *
 * @param {*}  type - A type string to parse for import types.
 *
 * @returns {ParsedImportType | undefined} Result of parsed import type or undefined.
 */
declare function parseImportType(type: any): ParsedImportType | undefined;
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
declare function parseImportTypesFromBlock({
  block,
  tag,
  first,
}: {
  block: comment_parser.Block;
  tag: string;
  first?: boolean;
}): ParsedImportType[] | undefined;
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
/**
 * Defines the parts of an import type statement.
 */
type ParsedImportType = {
  /**
   * Fully qualified symbol including namespace.
   */
  identFull: string;
  /**
   * The first part of the imported symbol to synthesize a module import.
   */
  identImport: string;
  /**
   * The module / package imported.
   */
  module: string;
};

export { type ParsedImportType, logger, parseImportType, parseImportTypesFromBlock, regexImportType };
