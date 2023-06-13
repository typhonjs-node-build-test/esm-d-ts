import * as comment_parser from 'comment-parser';
import ts from 'typescript';

/**
 * Removes all nodes with the matching JSDoc tags provided. This is useful for handling the `@internal` tag removing
 * all declarations that are not part of the public API.
 *
 * @param {string | Iterable<string>}  tags - A single tag or iterable list of tags that trigger removing the given AST
 * Node.
 *
 * @returns {ts.TransformerFactory<ts.Bundle|ts.SourceFile>} A custom transformer to remove nodes by JSDoc tags.
 */
declare function jsdocRemoveNodeByTags(tags: string | Iterable<string>): ts.TransformerFactory<ts.Bundle | ts.SourceFile>;
/**
 * Provides a convenient "meta-transformer" that invokes a handler function for each Node w/ the parsed leading
 * comment data for the Node. Only leading block comments are parsed. The `parsed` array is in the data format provided
 * by the `comment-parser` package. For convenience there are `lastComment` and `lastParsed` fields that return the
 * last comment block respectively before the node. Typically, the last comment is the active JSDoc block for a Node.
 *
 * Note: In the handler return null to remove the Node.
 *
 * @param {(data: { node: ts.Node, sourceFile: ts.SourceFile, comments: string[],
 *         parsed: import('comment-parser').Block[], lastComment: string,
 *          lastParsed: import('comment-parser').Block }) => *}  handler - A function to process JSDoc comments.
 *
 * @returns {ts.TransformerFactory<ts.Bundle|ts.SourceFile>} JSDoc custom "meta-transformer".
 */
declare function jsdocTransformer(handler: (data: {
    node: ts.Node;
    sourceFile: ts.SourceFile;
    comments: string[];
    parsed: comment_parser.Block[];
    lastComment: string;
    lastParsed: comment_parser.Block;
}) => any): ts.TransformerFactory<ts.Bundle | ts.SourceFile>;
/**
 * Returns the leading comment strings for a Node.
 *
 * @param {ts.Node}  node - Node being processed.
 *
 * @param {ts.SourceFile}  sourceFile - The source file of the Node.
 *
 * @returns {string[]|undefined} All leading comment block strings.
 */
declare function getLeadingComments(node: ts.Node, sourceFile: ts.SourceFile): string[] | undefined;
/**
 * Parses all leading JSDoc like block comments for the given Node.
 *
 * @param {ts.Node}  node - Node being processed.
 *
 * @param {ts.SourceFile}  sourceFile - The source file of the Node.
 *
 * @returns {{
 *    comments: string[],
 *    parsed: import('comment-parser').Block[],
 *    lastComment: string,
 *    lastParsed: import('comment-parser').Block
 * }} The parsed leading comments.
 */
declare function parseLeadingComments(node: ts.Node, sourceFile: ts.SourceFile): {
    comments: string[];
    parsed: comment_parser.Block[];
    lastComment: string;
    lastParsed: comment_parser.Block;
};

export { getLeadingComments, jsdocRemoveNodeByTags, jsdocTransformer, parseLeadingComments };
