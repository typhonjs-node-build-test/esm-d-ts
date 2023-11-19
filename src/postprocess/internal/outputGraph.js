import fs from 'fs-extra';

/**
 * Provides an internal processor that simply serializes the inheritance graph JSON to the given filepath.
 *
 * @param {string}            filepath - A file path to output the inheritance graph.
 *
 * @param {string | number}   indentation - Passed to `JSON.stringify` for `space`.
 *
 * @returns {import('../').ProcessorFunction} The output graph processor function.
 */
export function outputGraph(filepath, indentation)
{
   /**
    * @param {object} options - Options
    *
    * @param {import('@typhonjs-build-test/esm-d-ts/util').Logger} options.Logger - Logger class.
    *
    * @param {import('../GraphAnalysis.js').GraphAnalysis<import('../').InheritanceNodes>} options.inheritance -
    *        Inheritance graph
    */
   function outputDependencyGraph({ Logger, inheritance })
   {
      try
      {
         fs.writeFileSync(filepath, JSON.stringify(inheritance.toJSON(), null, indentation));
      }
      catch (err)
      {
         Logger.error(`[outputDependencyGraph] Failed to write file inheritance graph:\n${err.message}`);
      }
   }

   return outputDependencyGraph;
}
