import fs                     from 'node:fs';

import { isFile }             from '@typhonjs-utils/file-util';
import { isIterable }         from '@typhonjs-utils/object';
import { Project }            from 'ts-morph';
import ts                     from 'typescript';

import { DependencyParser }   from './DependencyParser.js';
import { GraphAnalysis }      from './GraphAnalysis.js';

import { logger }             from '#util';

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
    * @param {Iterable<import('./').ProcessorFunction>}   options.processors - List of processor functions.
    *
    * @param {boolean}  [options.dependencies=false] - When true generate dependencies graph analysis.
    *
    * @param {boolean}  [options.logStart=false] - When true verbosely log processor start.
    *
    * @param {string}   [options.output] - Alternate output filepath for testing.
    */
   static process({ filepath, processors, dependencies = false, logStart = false, output })
   {
      if (typeof filepath !== 'string')
      {
         throw new TypeError(`PostProcess.process error: 'filepath' is not a string.`);
      }

      if (!isFile(filepath))
      {
         throw new TypeError(`PostProcess.process error: 'filepath' does not exist:\n${filepath}`);
      }

      if (!isIterable(processors))
      {
         throw new TypeError(`PostProcess.process error: 'processors' is not an iterable list.`);
      }

      if (typeof dependencies !== 'boolean')
      {
         throw new TypeError(`PostProcess.process error: 'dependencies' is not a boolean.`);
      }

      if (typeof logStart !== 'boolean')
      {
         throw new TypeError(`PostProcess.process error: 'logStart' is not a boolean.`);
      }

      if (output !== void 0 && typeof output !== 'string')
      {
         throw new TypeError(`PostProcess.process error: 'output' is not a string.`);
      }

      const project = new Project({
         compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ES2022,
         },
         useVirtualFileSystem: true
      });

      // Add the declaration file to the project
      const sourceFile = project.addSourceFileAtPath(filepath);

      /** @type {GraphAnalysis<import('./').DependencyNodes, import('./').DependencyGraphJSON>} */
      let graphAnalysis;

      if (dependencies)
      {
         graphAnalysis = new GraphAnalysis(DependencyParser.parse(sourceFile));
      }

      let cntr = -1;

      for (const processor of processors)
      {
         cntr++;

         if (typeof processor !== 'function')
         {
            logger.warn(`PostProcess.process warning: skipping processor[${cntr}] as it is not a function.`);
            continue;
         }

         if (logStart && logger.is.verbose)
         {
            logger.verbose(`PostProcess.process: Starting processor '${processor.name}'.`);
         }

         try
         {
            processor({ logger, sourceFile, dependencies: graphAnalysis });
         }
         catch (err)
         {
            logger.error(
             `PostProcess.process error: processor[${cntr}] raised an error (aborting processing):\n${err.message}`);

            logger.debug(err);

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
            logger.error(`PostProcess.process error: Failed to write postprocessing output to '${
             output}':\n${err.message}`);
         }
      }
      else
      {
         sourceFile.saveSync();
      }
   }
}
