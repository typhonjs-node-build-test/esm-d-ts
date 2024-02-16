import ts                     from 'typescript';

import { jsdocTransformer }   from '../index.js';

/**
 * A custom transformer that copies the first `@param` name for setter accessor declarations to the AST node.
 *
 * Note: This is fixed in `TS 5.3+`, but this transformer remains valid until the minimum peer dependency is raised.
 * Before `TS 5.3` in compilation for ESM the setter accessor declaration parameter name is renamed to `arg`
 * despite possibly being named something else. This can cause downstream issues with tooling like TypeDoc when the
 * JSDoc comment for the parameter name does not match any `@param` tagged setter.
 *
 * @returns {(
 *    import('typescript').TransformerFactory<import('typescript').Bundle|import('typescript').SourceFile>
 * )} A custom transformer to rename setter declaration AST node parameter name.
 */
export function jsdocSetterParamName()
{
   // const nodeTest = (node) => ts.isSetAccessorDeclaration(node);

   // Only consider the last parsed comment as that is the active JSDoc comment.
   return jsdocTransformer(({ node, lastParsed }) =>
   {
      // if (ts.isSetAccessorDeclaration(node))
      // {
         let firstParamTagName;

         // Store the first `@param` name.
         for (const entry of lastParsed.tags)
         {
            if (entry.tag === 'param' && typeof entry.name === 'string' && entry.name.length)
            {
               firstParamTagName = entry.name;
               break;
            }
         }

         // Copy over first param name from JSDoc tag if the AST node parameter name is defined and different.
         /* v8 ignore next 5 */
         if (firstParamTagName !== void 0 && typeof node?.parameters[0]?.name?.escapedText === 'string' &&
          firstParamTagName !== node.parameters[0].name.escapedText)
         {
            node.parameters[0].name.escapedText = firstParamTagName;
         }
      // }
   }, void 0, ({ node }) => ts.isSetAccessorDeclaration(node));
}
