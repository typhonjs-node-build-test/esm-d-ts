import ts                              from 'typescript';

import { jsdocTransformer }            from '../index.js';

import { parseImportTypesFromBlock }   from '#util';

/**
 * A custom transformer that supports `import types` for the `@implements` JSDoc tag on class declarations.
 *
 * Note: Currently in Typescript compilation for import types is not supported for `@implements`.
 *
 * @returns {(
 *    import('typescript').TransformerFactory<import('typescript').Bundle|import('typescript').SourceFile>
 * )} A custom transformer to synthetically add the type import and assignment of `@implements` for dynamic imports.
 */
export function jsdocImplementsImportType()
{
   /**
    * Stores the identifier strings for synthetic import declaration generation from `@implements` tags. In the post
    * process step these imports are added to the top of the associated output DTS source file. The imports are grouped
    * by import module path.
    *
    * @type {Map<string, Set<string>>}
    */
   const importIdents = new Map();

   // Only consider the last parsed comment as that is the active JSDoc comment.
   return jsdocTransformer(({ node, lastParsed }) =>
   {
      // if (ts.isClassDeclaration(node) && lastParsed)
      // {
         /**
          * Stores all synthetic import identifiers for the class.
          *
          * @type {Set<string>}
          */
         const implementIdents = new Set();

         const results = parseImportTypesFromBlock({ block: lastParsed, tag: 'implements' });
         if (results?.length)
         {
            for (const result of results)
            {
               // Add the imported identifier to the module Map.
               if (importIdents.has(result.module)) { importIdents.get(result.module).add(result.identImport); }
               else { importIdents.set(result.module, new Set([result.identImport])); }

               // Add the qualified name to be added as an implemented interface.
               implementIdents.add(result.identFull);
            }
         }

         if (implementIdents.size)
         {
            // Create the implement expressions.
            const implementExpressions = [...implementIdents].sort().map((ident) =>
             ts.factory.createExpressionWithTypeArguments(ts.factory.createIdentifier(ident), []));

            // Create the implement heritage clause.
            const implementClauses = ts.factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword,
             implementExpressions);

            // Update the class declaration with the implements heritage clause leaving any extends clause in place.
            return ts.factory.updateClassDeclaration(node, node.modifiers, node.name, node.typeParameters,
             node.heritageClauses.filter((clause) => clause.token !== ts.SyntaxKind.ImplementsKeyword).concat(
              implementClauses), node.members);
         }
      // }
   },

    /**
     * Handles modifying the source file synthetically adding `import type` named imports for `@implements` tags.
     *
     * @param {ts.SourceFile} sourceFile -
     *
     * @returns {ts.SourceFile | undefined} Potentially modified source file.
     */
   (sourceFile) =>
   {
      if (importIdents.size)
      {
         const importDeclarations = [];

         for (const module of [...importIdents.keys()].sort())
         {
            const idents = [...importIdents.get(module)].sort();

            const importClause = ts.factory.createImportClause(true, void 0, ts.factory.createNamedImports(
             idents.map((indent) => ts.factory.createImportSpecifier(false, void 0,
              ts.factory.createIdentifier(indent)))));

            const importDeclaration = ts.factory.createImportDeclaration(void 0, importClause,
             ts.factory.createStringLiteral(module));

            importDeclarations.push(importDeclaration);
         }

         importIdents.clear();

         // Update the source file with synthetic import type declarations.
         return ts.factory.updateSourceFile(sourceFile, ts.factory.createNodeArray(
          [...importDeclarations, ...sourceFile.statements]));
      }
   }, ({ node }) => ts.isClassDeclaration(node));
}
