import cytoscape  from 'cytoscape';

/**
 * Provides a wrapper around a headless `cytoscape` instance loaded with the given graph data and usually `ts-morph`
 * nodes of interest.
 *
 * A GraphAnalysis instance for the inheritance class structure is passed into the postprocessor
 * {@link ProcessorFunction} functions managed by {@link PostProcess}.
 *
 * @template T
 */
export class GraphAnalysis
{
   /** @type {import('cytoscape').Core} */
   #cy;

   /**
    * The node map to look up data associated with the given graph node ID.
    *
    * @type {Map<string, T>}
    */
   #nodes;

   /**
    * @param {object}         options - Options.
    *
    * @param {object[]}         options.graph - The graph data
    *
    * @param {Map<string, T>} options.nodes - The Node map.
    */
   constructor({ graph, nodes })
   {
      this.#cy = cytoscape({
         elements: graph,
         headless: true
      });

      this.#nodes = nodes;
   }

   /**
    * @returns {import('cytoscape').Core} The cytoscape core instance.
    */
   get cytoscape()
   {
      return this.#cy;
   }

   /**
    * @returns {Map<string, T>} The Node Map.
    */
   get nodes()
   {
      return this.#nodes;
   }

   /**
    * Perform a depth first search of the graph.
    *
    * @param {import('cytoscape').SearchVisitFunction}  visit - A cytoscape search visit function.
    *
    * @param {object} [options] - Options.
    *
    * @param {boolean}  [options.directed] - A boolean indicating whether the algorithm should only go along edges
    *        from source to target
    */
   depthFirstSearch(visit, { directed = false } = {})
   {
      // Find root nodes (nodes with no parents)
      const rootNodes = this.#cy.nodes().filter((node) => node.indegree() === 0);

      for (const rootNode of rootNodes)
      {
         rootNode.successors().dfs({
            root: rootNode,
            visit,
            directed
         });
      }
   }
}
