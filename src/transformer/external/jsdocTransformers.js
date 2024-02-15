import { isIterable }            from '@typhonjs-utils/object';
import ts                        from 'typescript';
import { parseLeadingComments }  from '#util';

/**
 * Removes all nodes with the matching JSDoc tags provided. This is useful for handling the `@internal` tag removing
 * all declarations that are not part of the public API.
 *
 * @param {string | Iterable<string>}  tags - A single tag or iterable list of tags that trigger removing the given AST
 * Node.
 *
 * @returns {ts.TransformerFactory<ts.Bundle|ts.SourceFile>} A custom transformer to remove nodes by JSDoc tags.
 */
export function jsdocRemoveNodeByTags(tags)
{
   if (typeof tags !== 'string' && !isIterable(tags))
   {
      throw new TypeError(`[esm-d-ts] jsdocRemoveNodeByTags error: 'tags' is not a string or iterable list.`);
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
      // Ensure that we convert any iterable to a Set.
      const tagsSet = tags instanceof Set ? tags : new Set(tags);

      return jsdocTransformer(({ lastParsed }) =>
      {
         // Only consider the last parsed comment as that is the active JSDoc comment and return null to remove Node.
         for (const entry of lastParsed.tags)
         {
            if (tagsSet.has(entry.tag)) { return null; }
         }
      });
   }
}

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
 *    lastParsed: import('comment-parser').Block
 * }) => *)}  handler - A function to process AST nodes with JSDoc comments.
 *
 * @param {(sourceFile: ts.SourceFile) => ts.SourceFile | undefined} [postHandler] - A function to postprocess the
 *        source file after all nodes visited. Return an updated SourceFile node.
 *
 * @returns {ts.TransformerFactory<ts.Bundle|ts.SourceFile>} JSDoc custom "meta-transformer".
 */
export function jsdocTransformer(handler, postHandler)
{
   if (typeof handler !== 'function')
   {
      throw new TypeError(`[esm-d-ts] jsdocTransformer error: 'handler' is not a function.`);
   }

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
            const visitedSourceFile = ts.visitNode(sourceFileOrBundle, (node) => visit(node, sourceFileOrBundle));

            // Allow postprocessing of source file after all nodes visited.
            if (typeof postHandler === 'function')
            {
               const processedSourceFile = postHandler(visitedSourceFile);
               if (processedSourceFile && ts.isSourceFile(processedSourceFile)) { return processedSourceFile; }
            }

            return visitedSourceFile;
         }
         else if (ts.isBundle(sourceFileOrBundle))
         {
            const newSourceFiles = sourceFileOrBundle.sourceFiles.map((sourceFile) =>
            {
               const visitedSourceFile = ts.visitNode(sourceFile, (node) => visit(node, sourceFile));

               // Allow postprocessing of source file after all nodes visited.
               if (typeof postHandler === 'function')
               {
                  const processedSourceFile = postHandler(visitedSourceFile);
                  if (processedSourceFile && ts.isSourceFile(processedSourceFile)) { return processedSourceFile; }
               }

               return visitedSourceFile;
            });

            return ts.factory.updateBundle(sourceFileOrBundle, newSourceFiles);
         }
      };
   };
}
