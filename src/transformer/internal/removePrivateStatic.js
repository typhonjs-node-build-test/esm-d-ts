import ts   from 'typescript';

// Provides a regex to test the shape of renamed static private members.
const s_REGEX_STATIC_PRIVATE = /__#\d+@#.*/;

/**
 * Test if a Node is in the shape of a private static member.
 *
 * @param {ts.Node}  node - AST node to test for static private state.
 *
 * @returns {boolean} Whether the node is static private scoped.
 */
function filterPrivateStatic(node)
{
   if (ts.isPropertyDeclaration(node) || ts.isMethodDeclaration(node))
   {
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
 * Note: A side effect of removing renamed private static nodes is that there may be leftover imports that were used
 * in the private static member. A Rollup warning will be generated in this case.
 *
 * @returns {ts.TransformerFactory<ts.Bundle|ts.SourceFile>} Transformer to remove private static nodes.
 */
export function removePrivateStatic()
{
   /**
    * @param {ts.TransformationContext} context -
    *
    * @returns {ts.Transformer<ts.Bundle|ts.SourceFile>} TS transformer
    */
   return (context) =>
   {
      /**
       * @param {ts.Bundle | ts.SourceFile} sourceFileOrBundle -
       *
       * @returns {ts.Bundle | ts.SourceFile | undefined} Processed Node.
       */
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
            return ts.visitNode(sourceFileOrBundle, (node) => visit(node));
         }
         else if (ts.isBundle(sourceFileOrBundle))
         {
            /** @type {ts.SourceFile[]} */
            const newSourceFiles = sourceFileOrBundle.sourceFiles.map(
             (sourceFile) => ts.visitNode(sourceFile, (node) => visit(node)));

            return ts.factory.updateBundle(sourceFileOrBundle, newSourceFiles);
         }
      };
   };
}
