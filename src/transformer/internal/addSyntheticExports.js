import ts   from 'typescript';

/**
 * Adds synthetic wildcard exports to the main declaration entry file for the given filepaths to extra compiled TS
 * files.
 *
 * @param {string}   entryFilepath - Filepath of main declaration entry file.
 *
 * @param {string[]} filepaths - The file paths of extra generated TS declaration files.
 *
 * @returns {function(*): function(*): ts.Node | (* & undefined) | (ts.Node & undefined)}
 */
export function addSyntheticExports(entryFilepath, filepaths)
{
   return (context) =>
   {
      return (sourceFileOrBundle) =>
      {
         const visit = (node) =>
         {
            if (ts.isSourceFile(node) && node.fileName === entryFilepath)
            {
               const exportDeclarations = [];

               for (const filepath of filepaths)
               {
                  exportDeclarations.push(ts.factory.createExportDeclaration(void 0, void 0, void 0,
                   ts.factory.createStringLiteral(filepath)));
               }

               const updatedStatements = ts.factory.createNodeArray([...node.statements, ...exportDeclarations]);

               return ts.factory.updateSourceFile(node, updatedStatements);
            }

            return ts.visitEachChild(node, visit, context);
         };

         if (ts.isSourceFile(sourceFileOrBundle))
         {
            return ts.visitNode(sourceFileOrBundle, (node) => visit(node));
         }
         else if (ts.isBundle(sourceFileOrBundle))
         {
            const newSourceFiles = sourceFileOrBundle.sourceFiles.map(
             (sourceFile) => ts.visitNode(sourceFile, (node) => visit(node)));

            return ts.factory.updateBundle(sourceFileOrBundle, newSourceFiles);
         }
      };
   };
}
