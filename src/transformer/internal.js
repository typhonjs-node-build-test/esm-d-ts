import ts   from 'typescript';

// Provides a regex to test the shape of renamed static private members.
const s_REGEX_STATIC_PRIVATE = /__#\d+@#.*/;

/**
 * Test if a Node is in the shape of a private static member. Also tests for the addition of a bare property
 * declaration: `#private;` which is added to classes with private static members.
 *
 * @param {ts.Node}  node - AST node to test for static private state.
 *
 * @returns {boolean} Whether the node is static private scoped.
 */
function filterPrivateStatic(node)
{
   if (ts.isPropertyDeclaration(node) || ts.isMethodDeclaration(node))
   {
      // Test for added `#private;` bare property declaration as this is added to classes with private static members.
      if (ts.isPrivateIdentifier(node?.name) && '#private' === node?.name?.escapedText) { return false; }

      const isStatic = node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) ?? false;

      return !(isStatic && s_REGEX_STATIC_PRIVATE.test(node?.name?.text));
   }

   return true;
}

/**
 * For a reason not presently known when creating declarations the Typescript compiler renames static private member
 * names to a string with it remaining in the public declaration. The pattern is similar to this "__#3@#initialize"
 * where the original was `#initialze()`.
 *
 * This transformer removes all private static members.
 *
 * Additionally, for classes with private static members an additional property declaration is added for `#private;`.
 * This is also removed by this transformer.
 *
 * @returns {ts.TransformerFactory<ts.Bundle|ts.SourceFile>} Transformer to remove private static nodes.
 */
export function removePrivateStatic()
{
   return (context) =>
   {
      return (sourceFileOrBundle) =>
      {
         /** @ignore */
         function visit(node)
         {
            if (!filterPrivateStatic(node)) { return null; }

            return ts.visitEachChild(node, visit, context);
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
