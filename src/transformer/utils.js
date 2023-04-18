import { parse }  from 'comment-parser';
import ts         from 'typescript';

/**
 * Returns the leading comment strings for a Node.
 *
 * @param {ts.Node}  node - Node being processed.
 *
 * @param {ts.SourceFile}  sourceFile - The source file of the Node.
 *
 * @returns {string[]|undefined} All leading comment block strings.
 */
export function getLeadingComments(node, sourceFile)
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
export function parseLeadingComments(node, sourceFile)
{
   const comments = [];
   const parsed = [];
   let lastComment, lastParsed;

   const allComments = getLeadingComments(node, sourceFile);
   if (allComments)
   {
      for (const comment of allComments)
      {
         const parsedComment = parse(comment);

         if (parsedComment.length)
         {
            comments.push(comment);
            parsed.push(parsedComment[0]);
         }
      }

      // Only invoke handler when there is at least one comment.
      if (parsed.length)
      {
         lastComment = comments[comments.length - 1];
         lastParsed = parsed[parsed.length - 1];
      }
   }

   return { comments, parsed, lastComment, lastParsed };
}
