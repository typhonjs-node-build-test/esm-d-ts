/**
 * Provides resources for AST transformation during type declarations compilation.
 *
 * @module
 */

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
declare function jsdocRemoveNodeByTags(
  tags: string | Iterable<string>,
): ts.TransformerFactory<ts.Bundle | ts.SourceFile>;
/**
 * Provides a convenient "meta-transformer" that invokes a handler function for each Node reducing the boilerplate
 * required w/ the parsed leading comment data for the Node. Only leading block comments are parsed. The `parsed` array
 * is in the data format provided by the `comment-parser` package. For convenience there are `lastComment` and
 * `lastParsed` fields that return the last comment block respectively before the node. Typically, the last comment is
 * the active JSDoc block for a Node.
 *
 * Note: In the `handler` return null to remove the Node. The `postHandler` allows final modification of the SourceFile
 * after all nodes are visited; return a new SourceFile to update it.
 *
 * @param {((data: {
 *    node: ts.Node,
 *    sourceFile: ts.SourceFile,
 *    comments: string[],
 *    parsed: import('comment-parser').Block[],
 *    lastComment: string,
 *    lastParsed: import('comment-parser').Block,
 *    context: ts.TransformationContext
 * }) => *)}  handler - A function to process AST nodes with JSDoc comments.
 *
 * @param {(sourceFile: ts.SourceFile) => ts.SourceFile | undefined} [postHandler] - A function to postprocess the
 *        source file after all nodes visited. Return an updated SourceFile node.
 *
 * @param {(data: { node?: ts.Node, sourceFile?: ts.SourceFile }) => boolean} [nodeTest] - Test the node type before
 *        parsing comments. Both Node and SourceFile are available for testing. When defined return a `true` to parse
 *        the node JSDoc comments.
 *
 * @returns {ts.TransformerFactory<ts.Bundle|ts.SourceFile>} JSDoc custom "meta-transformer".
 */
declare function jsdocTransformer(
  handler: (data: {
    node: ts.Node;
    sourceFile: ts.SourceFile;
    comments: string[];
    parsed: comment_parser.Block[];
    lastComment: string;
    lastParsed: comment_parser.Block;
    context: ts.TransformationContext;
  }) => any,
  postHandler?: (sourceFile: ts.SourceFile) => ts.SourceFile | undefined,
  nodeTest?: (data: { node?: ts.Node; sourceFile?: ts.SourceFile }) => boolean,
): ts.TransformerFactory<ts.Bundle | ts.SourceFile>;

/**
 * Provides a convenient "meta-transformer" that invokes a handler function for each Node reducing the boilerplate
 * required.
 *
 * Note: In the `handler` return null to remove the Node. The `postHandler` allows final modification of the SourceFile
 * after all nodes are visited; return a new SourceFile to update it.
 *
 * @param {((data: {
 *    node: ts.Node,
 *    sourceFile: ts.SourceFile,
 *    context: ts.TransformationContext
 * }) => *)}  handler - A function to process AST nodes.
 *
 * @param {(sourceFile: ts.SourceFile) => ts.SourceFile | undefined} [postHandler] - A function to postprocess the
 *        source file after all nodes visited. Return an updated SourceFile node.
 *
 * @returns {ts.TransformerFactory<ts.Bundle|ts.SourceFile>} JSDoc custom "meta-transformer".
 */
declare function transformer(
  handler: (data: { node: ts.Node; sourceFile: ts.SourceFile; context: ts.TransformationContext }) => any,
  postHandler?: (sourceFile: ts.SourceFile) => ts.SourceFile | undefined,
): ts.TransformerFactory<ts.Bundle | ts.SourceFile>;

export { jsdocRemoveNodeByTags, jsdocTransformer, transformer };
