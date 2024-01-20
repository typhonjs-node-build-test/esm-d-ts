import ts               from 'typescript';
import upath            from 'upath';

import { transformer }  from '../external/transformer.js';

/**
 * Adds synthetic wildcard exports to the main declaration entry file for the given filepaths to extra compiled TS
 * files.
 *
 * @param {string}   entryFilepath - Filepath of main declaration entry file.
 *
 * @param {string[]} filepaths - The file paths of extra generated TS declaration files.
 *
 * @returns {ts.TransformerFactory<ts.Bundle|ts.SourceFile>} Transformer add synthetic exports to entry file from file
 * paths given.
 */
export function addSyntheticExports(entryFilepath, filepaths)
{
   return transformer(({ node }) =>
   {
      if (ts.isSourceFile(node) && node.fileName === entryFilepath)
      {
         const dirname = upath.dirname(entryFilepath);

         const exportDeclarations = [];

         for (const filepath of filepaths)
         {
            // Must be relative to the entry point and no extension; the module resolution is `bundler`.
            const adjustedPath = `./${upath.relative(dirname, upath.removeExt(filepath, '.ts'))}`;

            exportDeclarations.push(ts.factory.createExportDeclaration(void 0, void 0, void 0,
             ts.factory.createStringLiteral(adjustedPath)));
         }

         const updatedStatements = ts.factory.createNodeArray([...node.statements, ...exportDeclarations]);

         return ts.factory.updateSourceFile(node, updatedStatements);
      }
   });
}
