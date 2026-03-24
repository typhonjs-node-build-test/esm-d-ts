import ts         from 'typescript';
import { parse }  from 'comment-parser';

/**
 * Returns the leading comment strings for a Node.
 *
 * @param {ts.Node | import('ts-morph').ts.Node}  node - Node being processed.
 *
 * @param {ts.SourceFile | import('ts-morph').SourceFile}   sourceFile - The TS source file node.
 *
 * @returns {string[]|undefined} All leading comment block strings.
 */
export function getLeadingComments(node, sourceFile)
{
   if (node.pos < 0 || node.end < 0) { return; }

   const sourceFileText = sourceFile.getFullText();

   const commentRanges = ts.getLeadingCommentRanges(sourceFileText, node.getFullStart());

   if (!commentRanges) { return; }

   const results = [];

   for (const commentRange of commentRanges)
   {
      results.push(sourceFileText.substring(commentRange.pos, commentRange.end));
   }

   return results;
}

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
export function parseLeadingComments(node, sourceFile, options = { spacing: 'preserve' })
{
   const comments = [];
   const parsed = [];
   let lastComment, lastParsed;

   const allComments = getLeadingComments(node, sourceFile);
   if (allComments)
   {
      for (const comment of allComments)
      {
         const parsedComment = parse(comment, options);

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

/**
 * @typedef {object} ParsedLeadingComments Defines all leading JSDoc comments for a Typescript compiler node.
 *
 * @property {string[]} comments - All raw JSDoc comment blocks.
 *
 * @property {import('comment-parser').Block[]} parsed - All parsed JSDoc comment blocks.
 *
 * @property {string} lastComment - Last raw JSDoc comment block before node.
 *
 * @property {import('comment-parser').Block} lastParsed - Last parsed leading JSDoc comment block before node.
 */
