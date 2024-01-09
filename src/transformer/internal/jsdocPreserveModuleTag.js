import { jsdocTransformer } from '../index.js';

/**
 * A custom transformer that collects all JSDoc comment blocks with the `@module` tag.
 *
 * @param {[]} moduleComments - Collects all processed comment blocks.
 *
 * @param {string}   fileName - Main input filepath.
 *
 * @returns {(
 *    import('typescript').TransformerFactory<import('typescript').Bundle|import('typescript').SourceFile>
 * )} A custom transformer to collecting all `@module` JSDoc comments.
 */
export function jsdocPreserveModuleTag(moduleComments, fileName)
{
   // Only consider the last parsed comment as that is the active JSDoc comment and return null to remove Node.
   return jsdocTransformer(({ sourceFile, lastComment, lastParsed }) =>
   {
      for (const entry of lastParsed.tags)
      {
         if ((entry.tag === 'module' || entry.tag === 'packageDocumentation') && fileName === sourceFile.fileName)
         {
            moduleComments.push({
               filepath: sourceFile.fileName,
               comment: lastComment
            });
         }
      }
   });
}
