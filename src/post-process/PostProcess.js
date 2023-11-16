import fs                     from 'fs-extra';
import ts                     from 'typescript';

import { Project }            from 'ts-morph';

import { GraphAnalysis }      from './GraphAnalysis.js';
import { InheritanceParser }  from './InheritanceParser.js';

export class PostProcess
{
   /**
    * @param {object}   options - Options
    *
    * @param {string}   options.filepath - Source DTS file to process.
    *
    * @param {string}   [options.output] - Alternate output file path for testing.
    *
    * @param {Iterable<import('./').ProcessorFunction>}   [options.processors] - List of processor functions.
    */
   static process({ filepath, output, processors })
   {
      const project = new Project({
         target: ts.ScriptTarget.ES2022,
         module: ts.ModuleKind.ES2022,
      });

      // Add the declaration file to the project
      const sourceFile = project.addSourceFileAtPath(filepath);

      const inheritance = new GraphAnalysis(InheritanceParser.parse(sourceFile));

      for (const processor of processors) { processor({ sourceFile, inheritance }); }

      if (output)
      {
         fs.writeFileSync(output, sourceFile.getFullText());
      }
      else
      {
         sourceFile.saveSync();
      }
   }
}
