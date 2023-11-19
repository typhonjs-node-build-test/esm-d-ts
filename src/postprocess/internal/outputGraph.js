import fs from 'fs-extra';

/**
 * Provides an internal processor that simply serializes the dependencies graph JSON to the given filepath.
 *
 * @param {string}            filepath - A file path to output the dependencies graph.
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
    * @param {import('../GraphAnalysis.js').GraphAnalysis<import('../').DependencyNodes>} options.dependencies -
    *        dependencies graph.
    */
   function outputDependencyGraph({ Logger, dependencies })
   {
      try
      {
         fs.writeFileSync(filepath, JSON.stringify(dependencies.toJSON(), null, indentation));
      }
      catch (err)
      {
         Logger.error(`[outputDependencyGraph] Failed to write file for dependencies graph:\n${err.message}`);
      }
   }

   return outputDependencyGraph;
}
