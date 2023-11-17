import {
   ClassDeclaration,
   InterfaceDeclaration }  from 'ts-morph';

/**
 * Parses a ts-morph DTS source file for inheritance hierarchy data.
 *
 * TODO: Determine if in the future it is necessary to include InterfaceDeclarations in the inheritance graph.
 */
export class InheritanceParser
{
   /**
    * @param {import('ts-morph').SourceFile} sourceFile - DTS source file to parse.
    *
    * @returns {{ nodes: Map<string, import('ts-morph').ClassDeclaration>, graph: *[] }} Inheritance graph and nodes.
    */
   static parse(sourceFile)
   {
      const data = [];
      const graph = [];
      const nodes = new Map();

      // Process each relevant node in the file
      sourceFile.forEachChild((node) =>
      {
         // TODO: The following conditional includes interfaces & classes.
         // if (node instanceof ClassDeclaration || node instanceof InterfaceDeclaration)

         if (node instanceof ClassDeclaration)
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

      if (node instanceof ClassDeclaration)
      {
         const baseClass = node.getBaseClass();
         if (baseClass)
         {
            const baseClassName = baseClass.getName();

            if (!nodes.has(nodeName)) { nodes.set(nodeName, node); }
            if (!nodes.has(baseClassName)) { nodes.set(baseClassName, baseClass); }

            data.push({ child: nodeName, parent: baseClassName });
         }
      }
      else if (node instanceof InterfaceDeclaration)
      {
         if (!nodes.has(nodeName)) { nodes.set(nodeName, node); }

         for (const baseInterface of node.getBaseDeclarations())
         {
            if (baseInterface instanceof InterfaceDeclaration)
            {
               const baseInterfaceName = baseInterface.getName();

               if (!nodes.has(baseInterfaceName)) { nodes.set(baseInterfaceName, baseInterface); }

               data.push({ child: nodeName, parent: baseInterfaceName });
            }
         }
      }
   }
}
