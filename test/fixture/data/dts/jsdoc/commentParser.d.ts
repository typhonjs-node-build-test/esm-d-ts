/**
 * Returns the leading comment strings for a Node.
 *
 * @param {ts.Node | import('ts-morph').ts.Node}  node - Node being processed.
 *
 * @param {ts.SourceFile | import('ts-morph').SourceFile}   sourceFile - The TS source file node.
 *
 * @returns {string[]|undefined} All leading comment block strings.
 */
export function getLeadingComments(node: ts.Node | import('ts-morph').ts.Node, sourceFile: ts.SourceFile | import('ts-morph').SourceFile): string[] | undefined;
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
export function parseLeadingComments(node: ts.Node | import('ts-morph').ts.Node, sourceFile: ts.SourceFile | import('ts-morph').SourceFile, options?: any): ParsedLeadingComments;
/**
 * Defines all leading JSDoc comments for a Typescript compiler node.
 */
export type ParsedLeadingComments = {
    /**
     * - All raw JSDoc comment blocks.
     */
    comments: string[];
    /**
     * - All parsed JSDoc comment blocks.
     */
    parsed: import('comment-parser').Block[];
    /**
     * - Last raw JSDoc comment block before node.
     */
    lastComment: string;
    /**
     * - Last parsed leading JSDoc comment block before node.
     */
    lastParsed: import('comment-parser').Block;
};
import ts from 'typescript';
