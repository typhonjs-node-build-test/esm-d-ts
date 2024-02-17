import ts   from 'typescript';

/**
 * Provides a convenient "meta-transformer" that invokes a handler function for each Node reducing the boilerplate
 * required.
 *
 * Note: In the `handler` return null to remove the Node. The `postHandler` allows final modification of the SourceFile
 * after all nodes are visited; return a new SourceFile to update it.
 *
 * @param {((data: {
 *    node: ts.Node,
 *    sourceFile: ts.SourceFile,
 *    context: ts.TransformationContext
 * }) => *)}  handler - A function to process AST nodes.
 *
 * @param {(sourceFile: ts.SourceFile) => ts.SourceFile | undefined} [postHandler] - A function to postprocess the
 *        source file after all nodes visited. Return an updated SourceFile node.
 *
 * @returns {ts.TransformerFactory<ts.Bundle|ts.SourceFile>} JSDoc custom "meta-transformer".
 */
export function transformer(handler, postHandler)
{
   if (typeof handler !== 'function')
   {
      throw new TypeError(`[esm-d-ts] transformer error: 'handler' is not a function.`);
   }

   if (postHandler !== void 0 && typeof postHandler !== 'function')
   {
      throw new TypeError(`[esm-d-ts] transformer error: 'postHandler' is not a function.`);
   }

   return (context) =>
   {
      return (sourceFileOrBundle) =>
      {
         /** @ignore */
         function visit(node, sourceFile)
         {
            const result = handler({ node, sourceFile, context });
            if (result !== void 0) { return result === null ? void 0 : result; }

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
         /* v8 ignore next 18 */  // Currently only single source files are processed
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
