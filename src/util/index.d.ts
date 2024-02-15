import * as comment_parser from 'comment-parser';
import * as ts_morph from 'ts-morph';
import ts from 'typescript';
import * as _es_joy_jsdoccomment from '@es-joy/jsdoccomment';
import * as _typhonjs_utils_logger_color from '@typhonjs-utils/logger-color';

/**
 * Returns the leading comment strings for a Node.
 *
 * @param {ts.Node | import('ts-morph').ts.Node}  node - Node being processed.
 *
 * @param {ts.SourceFile | import('ts-morph').SourceFile}   sourceFile - The TS source file node.
 *
 * @returns {string[]|undefined} All leading comment block strings.
 */
declare function getLeadingComments(
  node: ts.Node | ts_morph.ts.Node,
  sourceFile: ts.SourceFile | ts_morph.SourceFile,
): string[] | undefined;
/**
 * Parses all leading JSDoc like block comments for the given Node.
 *
 * @param {ts.Node | import('ts-morph').ts.Node}  node - Node being processed.
 *
 * @param {ts.SourceFile | import('ts-morph').SourceFile}   sourceFile - The TS source file node.
 *
 * @param {Partial<import('comment-parser').Options>} [options] - Options for `comment-parser`. The default is to
 *        preserve spacing in comment descriptions. Please refer to the `comment-parser` documentation for options
 *        available. Currently, `comment-parser` doesn't export the `Options`.
 *
 * @returns {ParsedLeadingComments} The parsed leading comments.
 */
declare function parseLeadingComments(
  node: ts.Node | ts_morph.ts.Node,
  sourceFile: ts.SourceFile | ts_morph.SourceFile,
  options?: any,
): ParsedLeadingComments;
/**
 * Defines all leading JSDoc comments for a Typescript compiler node.
 */
type ParsedLeadingComments = {
  /**
   * - All raw JSDoc comment blocks.
   */
  comments: string[];
  /**
   * - All parsed JSDoc comment blocks.
   */
  parsed: comment_parser.Block[];
  /**
   * - Last raw JSDoc comment block before node.
   */
  lastComment: string;
  /**
   * - Last parsed leading JSDoc comment block before node.
   */
  lastParsed: comment_parser.Block;
};

/**
 * Provides a more flexible mechanism to modify JSDoc comment blocks. `comment-parser` is the main parsing mechanism
 * that `esm-d-ts` uses as well as the supporting package `@es-joy/jsdoccomment` for ESTree AST compatible parsing. The
 * latter AST format is much easier to modify and recreate a comment block.
 */
declare class ESTreeParsedComment {
  /**
   * @param {string}   rawComment - A JSDoc comment string.
   */
  constructor(rawComment: string);
  /**
   * @returns {import('@es-joy/jsdoccomment').JsdocBlock} ESTree AST.
   */
  get ast(): _es_joy_jsdoccomment.JsdocBlock;
  /**
   * Removes the JSDoc tags specified from the AST.
   *
   * @param {string | Set<string> | undefined} [tagNames] - A string or Set of strings defining tag names to remove
   *        from the AST. When undefined _all_ tags are removed.
   *
   * @returns {this} This instance.
   */
  removeTags(tagNames?: string | Set<string> | undefined): this;
  /**
   * Provides an iterator over all tags or a subset from the given tag names.
   *
   * @param {string | Set<string>} [tagNames] - A string or Set of strings defining tag names to iterate.
   *
   * @returns {IterableIterator<import('@es-joy/jsdoccomment').JsdocTag>} Tag iterator.
   * @yields {import('@es-joy/jsdoccomment').JsdocTag}
   */
  tags(tagNames?: string | Set<string>): IterableIterator<_es_joy_jsdoccomment.JsdocTag>;
  /**
   * @returns {string} Returns the comment block with current AST converted back to a string.
   */
  toString(): string;
  #private;
}

/**
 * Parses a string for bare / leading `import types` returning an object with the parts required to perform AST
 * manipulation. This is necessary to support `@implements`.
 *
 * If no import type statement detected the result is undefined.
 *
 * @param {*}  type - A type string to parse for import types.
 *
 * @returns {ParsedImportType | undefined} Result of parsed import type or undefined.
 */
declare function parseImportType(type: any): ParsedImportType | undefined;
/**
 * Parses all bare / leading import type statements from a parsed comment block given a JSDoc tag to parse for the type.
 * This is necessary to support `@implements`.
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

/**
 * Check if the given file path is a TS declaration file.
 *
 * @param {string}   filepath - Path to check.
 *
 * @returns {boolean} Returns if the given path is a TS declaration file.
 */
declare function isDTSFile(filepath: string): boolean;
/**
 * Check if the given file path is a standard TS file.
 *
 * @param {string}   filepath - Path to check.
 *
 * @returns {boolean} Returns if the given path is a standard TS file.
 */
declare function isTSFile(filepath: string): boolean;
/**
 * Check if the given file path is any supported TS file.
 *
 * @param {string}   filepath - Path to check.
 *
 * @returns {boolean} Returns if the given path is any supported TS file.
 */
declare function isTSFileExt(filepath: string): boolean;
/**
 * A regex to test if a file path is a Typescript declaration.
 *
 * @type {RegExp}
 */
declare const regexIsDTSFile: RegExp;
/**
 * A regex to test if a file path is a standard Typescript file.
 *
 * @type {RegExp}
 */
declare const regexIsTSFile: RegExp;
/**
 * A regex to test if a file path is any supported Typescript file.
 *
 * @type {RegExp}
 */
declare const regexIsTSFileExt: RegExp;

/**
 * Provides a ColorLogger instance accessible across the package.
 *
 * @type {import('@typhonjs-utils/logger-color').ColorLogger}
 */
declare const logger: _typhonjs_utils_logger_color.ColorLogger;

export {
  ESTreeParsedComment,
  type ParsedImportType,
  type ParsedLeadingComments,
  getLeadingComments,
  isDTSFile,
  isTSFile,
  isTSFileExt,
  logger,
  parseImportType,
  parseImportTypesFromBlock,
  parseLeadingComments,
  regexImportType,
  regexIsDTSFile,
  regexIsTSFile,
  regexIsTSFileExt,
};
