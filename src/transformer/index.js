import { parse }  from 'comment-parser';
import ts         from 'typescript';

/**
 * @param {ts.Node}  node -
 *
 * @param {ts.SourceFile}  sourceFile -
 *
 * @returns {string[]|undefined} All leading comment block strings.
 */
function getLeadingComments(node, sourceFile)
{
   if (node.pos < 0 || node.end < 0) { return; }

   const commentRanges = ts.getLeadingCommentRanges(sourceFile.text, node.getFullStart());

   if (!commentRanges) { return; }

   const results = [];

   for (const commentRange of commentRanges)
   {
      results.push(sourceFile.text.substring(commentRange.pos, commentRange.end));
   }

   return results;
}

/**
 * TODO: Finish docs
 *
 * @param {({ node: ts.Node, sourceFile: ts.SourceFile, comments: string[], parsed: object[] }) => *}  handler -
 *
 * @returns {Function} JSDoc transformer that takes a handler to
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
            const comments = getLeadingComments(node, sourceFile);
            if (comments)
            {
               const parsed = [];

               for (const comment of comments)
               {
                  const parsedComment = parse(comment);

                  // TODO: Consider checking the `problems` array to reject adding to parsed comments.

                  if (parsedComment.length) { parsed.push(parsedComment[0]); }
               }

               // Only invoke handler when there is at least one comment.
               if (parsed.length)
               {
                  const result = handler({ node, sourceFile, comments, parsed });
                  if (result !== void 0) { return result === null ? void 0 : result; }
               }
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

/**
 * Removes all nodes with the matching JSDoc tags provided.
 *
 * @param {string|Set<string>}  tags - A single tag or set of tags that trigger removing the given AST Node.
 *
 * @returns {Function} Custom Transformer.
 */
export function removeNodeWithTags(tags)
{
   if (typeof tags !== 'string' && !(tags instanceof Set))
   {
      throw new TypeError(`esm-d-ts removeNodeWithTags error: 'tags' is not a string or Set.`);
   }

   if (typeof tags === 'string')
   {
      return jsdocTransformer(({ parsed }) =>
      {
         // Only consider the last parsed comment as that is the active JSDoc comment.
         const lastParsed = parsed[parsed.length - 1];

         for (const entry of lastParsed.tags)
         {
            // Return null to remove the Node.
            if (entry.tag === tags) { return null; }
         }
      });
   }
   else
   {
      return jsdocTransformer(({ parsed }) =>
      {
         // Only consider the last parsed comment as that is the active JSDoc comment.
         const lastParsed = parsed[parsed.length - 1];

         for (const entry of lastParsed.tags)
         {
            // Return null to remove the Node.
            if (tags.has(entry.tag)) { return null; }
         }
      });
   }
}
