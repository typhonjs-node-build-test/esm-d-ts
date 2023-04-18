import ts                        from 'typescript';

import { parseLeadingComments }  from './utils.js';

/**
 * Removes all nodes with the matching JSDoc tags provided. This is useful for handling the `@internal` tag removing
 * all declarations that are not part of the public API.
 *
 * @param {string|Set<string>}  tags - A single tag or set of tags that trigger removing the given AST Node.
 *
 * @returns {ts.TransformerFactory<ts.Bundle|ts.SourceFile>} A custom transformer to remove nodes by JSDoc tags.
 */
export function jsdocRemoveNodeByTags(tags)
{
   if (typeof tags !== 'string' && !(tags instanceof Set))
   {
      throw new TypeError(`esm-d-ts jsdocRemoveNodeByTags error: 'tags' is not a string or Set.`);
   }

   if (typeof tags === 'string')
   {
      // Only consider the last parsed comment as that is the active JSDoc comment and return null to remove Node.
      return jsdocTransformer(({ lastParsed }) =>
      {
         for (const entry of lastParsed.tags)
         {
            if (entry.tag === tags) { return null; }
         }
      });
   }
   else
   {
      return jsdocTransformer(({ lastParsed }) =>
      {
         // Only consider the last parsed comment as that is the active JSDoc comment and return null to remove Node.
         for (const entry of lastParsed.tags)
         {
            if (tags.has(entry.tag)) { return null; }
         }
      });
   }
}

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
export function jsdocTransformer(handler)
{
   if (typeof handler !== 'function') { throw new TypeError(`esm-d-ts error: 'handler' is not a function.`); }

   return (context) =>
   {
      return (sourceFileOrBundle) =>
      {
         /** @ignore */
         function visit(node, sourceFile)
         {
            const { comments, parsed, lastComment, lastParsed } = parseLeadingComments(node, sourceFile);

            if (lastParsed)
            {
               const result = handler({ node, sourceFile, comments, parsed, lastComment, lastParsed });
               if (result !== void 0) { return result === null ? void 0 : result; }
            }

            return ts.visitEachChild(node, (childNode) => visit(childNode, sourceFile), context);
         }

         if (ts.isSourceFile(sourceFileOrBundle))
         {
            return ts.visitNode(sourceFileOrBundle, (node) => visit(node, sourceFileOrBundle));
         }
         else if (ts.isBundle(sourceFileOrBundle))
         {
            const newSourceFiles = sourceFileOrBundle.sourceFiles.map(
             (sourceFile) => ts.visitNode(sourceFile, (node) => visit(node, sourceFile)));

            return ts.updateBundle(sourceFileOrBundle, newSourceFiles);
         }
      };
   };
}
