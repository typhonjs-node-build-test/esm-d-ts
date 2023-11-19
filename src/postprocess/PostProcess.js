import { isIterable }         from '@typhonjs-utils/object';
import fs                     from 'fs-extra';

import {
   ClassDeclaration,
   FunctionDeclaration,
   InterfaceDeclaration,
   Project,
   TypeAliasDeclaration,
   VariableDeclaration }      from 'ts-morph';

import ts                     from 'typescript';

import { DependencyParser }   from './DependencyParser.js';
import { GraphAnalysis }      from './GraphAnalysis.js';

import { Logger }             from '#logger';

/**
 * Provides management of execution of creating a `ts-morph` project and coordinating postprocessing
 * {@link ProcessorFunction} functions acting on the `ts-morph` SourceFile. The input `filepath` should be a bundled
 * Typescript declaration file. Any postprocessing is automatically saved to the same file.
 */
export class PostProcess
{
   /**
    * Defines the declaration types that are included in the inheritance GraphAnalysis.
    *
    * @type {Set<import('./').InheritanceNodes>}
    */
   static #defaultInheritanceTypes = new Set([
      ClassDeclaration,
      FunctionDeclaration,
      InterfaceDeclaration,
      TypeAliasDeclaration,
      VariableDeclaration
   ]);

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

      /** @type {GraphAnalysis<import('./').InheritanceNodes, import('./').InheritanceGraph>} */
      const dependencies = new GraphAnalysis(DependencyParser.parse(sourceFile, this.#defaultInheritanceTypes));

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
            processor({ Logger, sourceFile, dependencies });
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
