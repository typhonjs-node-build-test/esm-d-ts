import ts                     from 'typescript';
import path                   from 'upath';

import { jsdocTransformer }   from '../index.js';

/**
 * Matches dynamic named import types; IE `import('./types').Value`. It is lenient and allows the import to be enclosed
 * in `()` which helps for `checkJs` support / prevents TS from choking as import types in `@implements` tags is not
 * supported by TS.
 *
 * Capture group `1`: module path.
 * Capture group `2`: top level import identifier.
 * Optional capture group `3`: remainder of potential namespaced symbol.
 *
 * @type {RegExp}
 */
const s_REGEX_DYNAMIC_IMPORT = /import\(['"]([^'"]+)['"]\)\.([^.\s]+?)(?:\.([^)\s]+?))?(?=\)?$)/;

/**
 * A custom transformer that supports dynamic import for `@implements` JSDoc tag on class declarations.
 *
 * Note: Currently in Typescript compilation for ESM dynamic import is not supported for `@implements`.
 *
 * @returns {(
 *    import('typescript').TransformerFactory<import('typescript').Bundle|import('typescript').SourceFile>
 * )} A custom transformer to synthetically add the type import and assignment of `@implements` for dynamic imports.
 */
export function jsdocImplementsDynamicImport()
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
      if (ts.isClassDeclaration(node))
      {
         /**
          * Stores all synthetic import identifiers for the class.
          *
          * @type {Set<string>}
          */
         const implementIdents = new Set();

         // Store the first `@param` name.
         for (const entry of lastParsed.tags)
         {
            if (entry.tag === 'implements' && typeof entry.type === 'string')
            {
               const match = s_REGEX_DYNAMIC_IMPORT.exec(entry.type);
               if (match)
               {
                  // Remove any extension as `Bundler` module resolution is used.
                  const module = path.trimExt(match[1].replace(/\.d\.ts$/, ''));

                  // This is the main imported identifier / symbol.
                  const ident = match[2];

                  // Captures any additional extended symbol; IE a namespaced identifier.
                  const extended = match[3] ?? void 0;

                  // Constructs the fully qualified interface identifier.
                  const qualified = extended ? `${ident}.${extended}` : ident;

                  // Add the imported identifier to the module Map.
                  if (importIdents.has(module)) { importIdents.get(module).add(ident); }
                  else { importIdents.set(module, new Set([ident])); }

                  // Add the qualified name to be added as an implemented interface.
                  implementIdents.add(qualified);
               }
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
      }
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
   });
}
