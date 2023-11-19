import { isIterable }         from '@typhonjs-utils/object';
import fs                     from 'fs-extra';
import {
   ClassDeclaration,
   Project }                  from 'ts-morph';
import ts                     from 'typescript';

import { GraphAnalysis }      from './GraphAnalysis.js';
import { InheritanceParser }  from './InheritanceParser.js';

import { Logger }             from '#logger';

/**
 * Provides management of execution of creating a `ts-morph` project and coordinating postprocessing
 * {@link ProcessorFunction} functions acting on the `ts-morph` SourceFile. The input `filepath` should be a bundled
 * Typescript declaration file. Any postprocessing is automatically saved to the same file.
 */
export class PostProcess
{
   /**
    * Performs postprocessing on a given Typescript declaration file in place. You may provide an alternate output
    * filepath to not overwrite the source file.
    *
    * @param {object}   options - Options
    *
    * @param {string}   options.filepath - Source DTS file to process.
    *
    * @param {string}   [options.output] - Alternate output filepath for testing.
    *
    * @param {Iterable<import('./').ProcessorFunction>}   options.processors - List of processor functions.
    */
   static process({ filepath, output, processors })
   {
      if (typeof filepath !== 'string')
      {
         throw new TypeError(`PostProcess.process error: 'filepath' is not a string.`);
      }

      if (output !== void 0 && typeof output !== 'string')
      {
         throw new TypeError(`PostProcess.process error: 'output' is not a string.`);
      }

      if (!isIterable(processors))
      {
         throw new TypeError(`PostProcess.process error: 'processors' is not an iterable list.`);
      }

      if (!fs.existsSync(filepath))
      {
         throw new TypeError(`PostProcess.process error: 'filepath' does not exist:\n${filepath}`);
      }

      const project = new Project({
         compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ES2022,
         }
      });

      // Add the declaration file to the project
      const sourceFile = project.addSourceFileAtPath(filepath);

      /** @type {GraphAnalysis<ClassDeclaration>} */
      const inheritance = new GraphAnalysis(InheritanceParser.parse(sourceFile, new Set([ClassDeclaration])));

      let cntr = -1;

      for (const processor of processors)
      {
         cntr++;

         if (typeof processor !== 'function')
         {
            Logger.warn(`PostProcess.process warning: skipping processor[${cntr}] as it is not a function.`);
            continue;
         }

         if (Logger.isVerbose) { Logger.verbose(`PostProcess.process: Starting processor '${processor.name}'.`); }

         try
         {
            processor({ Logger, sourceFile, inheritance });
         }
         catch (err)
         {
            Logger.error(
             `PostProcess.process error: processor[${cntr}] raised an error (aborting processing):\n${err.message}`);

            return;
         }
      }

      if (output)
      {
         try
         {
            fs.writeFileSync(output, sourceFile.getFullText());
         }
         catch (err)
         {
            Logger.error(`PostProcess.process error: Failed to write postprocessing output to '${
             output}':\n${err.message}`);
         }
      }
      else
      {
         sourceFile.saveSync();
      }
   }
}
