import cytoscape  from 'cytoscape';

export class GraphAnalysis
{
   #cy;
   #nodes;

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
