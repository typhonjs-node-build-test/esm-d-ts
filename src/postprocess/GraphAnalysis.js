import cytoscape  from 'cytoscape';

/**
 * Provides a wrapper around a headless `cytoscape` instance loaded with the given graph data and node Map.
 *
 * A GraphAnalysis instance for the inheritance class structure is passed into the postprocessor
 * {@link ProcessorFunction} functions managed by {@link PostProcess}.
 *
 * @template N
 * @template [G=object[]]
 */
export class GraphAnalysis
{
   /** @type {import('cytoscape').Core} */
   #cy;

   /**
    * The node map to look up data associated with the given graph node ID.
    *
    * @type {Map<string, N>}
    */
   #nodes;

   /**
    * @param {object}         options - Options.
    *
    * @param {object[]}       options.graph - The graph data
    *
    * @param {Map<string, N>} options.nodes - The Node map.
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
    * @returns {Map<string, N>} The Node Map.
    */
   get nodes()
   {
      return this.#nodes;
   }

   /**
    * Perform a breadth first search of the graph.
    *
    * @param {import('cytoscape').SearchVisitFunction}  visit - A cytoscape search visit function.
    *
    * @param {object}   [options] - Options.
    *
    * @param {boolean}  [options.directed=false] - A boolean indicating whether the algorithm should only go along edges
    *        from source to target.
    *
    * @param {string | Set<string>}   [options.type] - Specific type to retrieve.
    */
   bfs(visit, { directed = false, type } = {})
   {
      if (typeof visit !== 'function') { throw new TypeError(`'GraphAnalysis.bfs error: 'visit' is not a function.`); }

      if (directed !== void 0 && typeof directed !== 'boolean')
      {
         throw new TypeError(`'GraphAnalysis.bfs error: 'directed' is not a boolean.`);
      }

      const hasTypeString = typeof type === 'string';
      const hasTypeSet = type instanceof Set;

      if (type !== void 0 && !hasTypeString && !hasTypeSet)
      {
         throw new TypeError(`'GraphAnalysis.bfs error: 'type' is not a string or set of strings.`);
      }

      let visitImpl = visit;

      // Wrap visit function in `type` check.
      if (hasTypeString)
      {
         visitImpl = (v, e, u, i, depth) => { if (v.data('type') === type) { visit(v, e, u, i, depth); } };
      }
      else if (hasTypeSet)
      {
         visitImpl = (v, e, u, i, depth) => { if (type.has(v.data('type'))) { visit(v, e, u, i, depth); } };
      }

      // Find root nodes; nodes with no parents.
      const rootNodes = this.#cy.nodes().filter((node) => node.indegree(false) === 0);

      for (const rootNode of rootNodes)
      {
         rootNode.successors().bfs({
            root: rootNode,
            visit: visitImpl,
            directed
         });
      }
   }

   /**
    * Perform a depth first search of the graph.
    *
    * @param {import('cytoscape').SearchVisitFunction}  visit - A cytoscape search visit function.
    *
    * @param {object}   [options] - Options.
    *
    * @param {boolean}  [options.directed=false] - A boolean indicating whether the algorithm should only go along edges
    *        from source to target.
    *
    * @param {string | Set<string>}   [options.type] - Specific type to retrieve.
    */
   dfs(visit, { directed = false, type } = {})
   {
      if (typeof visit !== 'function') { throw new TypeError(`'GraphAnalysis.dfs error: 'visit' is not a function.`); }

      if (directed !== void 0 && typeof directed !== 'boolean')
      {
         throw new TypeError(`'GraphAnalysis.dfs error: 'directed' is not a boolean.`);
      }

      const hasTypeString = typeof type === 'string';
      const hasTypeSet = type instanceof Set;

      if (type !== void 0 && !hasTypeString && !hasTypeSet)
      {
         throw new TypeError(`'GraphAnalysis.dfs error: 'type' is not a string or set of strings.`);
      }

      let visitImpl = visit;

      // Wrap visit function in `type` check.
      if (hasTypeString)
      {
         visitImpl = (v, e, u, i, depth) => { if (v.data('type') === type) { visit(v, e, u, i, depth); } };
      }
      else if (hasTypeSet)
      {
         visitImpl = (v, e, u, i, depth) => { if (type.has(v.data('type'))) { visit(v, e, u, i, depth); } };
      }

      // Find root nodes; nodes with no parents.
      const rootNodes = this.#cy.nodes().filter((node) => node.indegree(false) === 0);

      for (const rootNode of rootNodes)
      {
         rootNode.successors().dfs({
            root: rootNode,
            visit: visitImpl,
            directed
         });
      }
   }

   /**
    * @returns {G} Returns a JSON array of the graph.
    */
   toJSON()
   {
      return this.#cy.elements().map((element) => element.json()?.data);
   }
}
