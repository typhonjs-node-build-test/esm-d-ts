import {
   ClassDeclaration,
   InterfaceDeclaration }  from 'ts-morph';

/**
 * Parses a ts-morph DTS source file for inheritance hierarchy data.
 */
export class InheritanceParser
{
   static parse(sourceFile)
   {
      const data = [];
      const graph = [];
      const nodes = new Map();

      // Process each relevant node in the file
      sourceFile.forEachChild((node) =>
      {
         if (node instanceof ClassDeclaration || node instanceof InterfaceDeclaration)
         {
            this.#extractInheritanceData(node, nodes, data);
         }
      });

      // Format graph data -------------------------------------------------------------------------------------------

      // Add nodes
      new Set(data.flatMap((item) => [item.child, item.parent])).forEach((name) => graph.push({ data: { id: name } }));

      // Add edges
      data.forEach((item) => graph.push({ data: { source: item.parent, target: item.child } }));

      return { graph, nodes };
   }

   static #extractInheritanceData(node, nodes, data)
   {
      const nodeName = node.getName();

      if (!nodes.has(nodeName)) { nodes.set(nodeName, node); }

      if (node instanceof ClassDeclaration)
      {
         const baseClass = node.getBaseClass();
         if (baseClass)
         {
            data.push({ child: nodeName, parent: baseClass.getName() });
         }
      }
      else if (node instanceof InterfaceDeclaration)
      {
         for (const baseInterface of node.getBaseDeclarations())
         {
            if (baseInterface instanceof InterfaceDeclaration)
            {
               data.push({ child: nodeName, parent: baseInterface.getName() });
            }
         }
      }
   }
}
