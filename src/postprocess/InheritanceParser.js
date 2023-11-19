import {
   ClassDeclaration,
   InterfaceDeclaration,
   VariableDeclaration }   from 'ts-morph';

/**
 * Parses a bundled DTS file via a ts-morph source file for inheritance hierarchy data.
 */
export class InheritanceParser
{
   /**
    * @template [T=import('./types').NameableNodeConstructor>]
    *
    * @param {import('ts-morph').SourceFile} sourceFile - DTS source file to parse.
    *
    * @param {Set<T>}   typeSet - The `ts-morph` declaration types to parse.
    *
    * @returns {{ graph: object[], nodes: Map<string, T> }} Inheritance graph and nodes.
    */
   static parse(sourceFile, typeSet)
   {
      const data = [];
      const graph = [];

      /** @type {Map<string, T>} */
      const nodes = new Map();

      // Process each child nodes.
      sourceFile.forEachChild((node) =>
      {
         if (typeof node?.getName !== 'function') { return; }

         for (const type of typeSet)
         {
            if (!(node instanceof type)) { continue; }

            if (node instanceof ClassDeclaration || node instanceof InterfaceDeclaration)
            {
               this.#extractInheritanceData(node, nodes, data);
            }
            else
            {
               const nodeName = node.getName();
               if (!nodes.has(nodeName)) { nodes.set(nodeName, node); }
               graph.push({ data: { id: nodeName } });
            }
         }
      });

      // Process any variable declarations / includes type aliases.
      if (typeSet.has(VariableDeclaration))
      {
         for (const node of sourceFile.getVariableDeclarations())
         {
            const nodeName = node.getName();
            if (!nodes.has(nodeName)) { nodes.set(nodeName, node); }
            graph.push({ data: { id: nodeName } });
         }
      }

      // Format graph data -------------------------------------------------------------------------------------------

      // Add nodes
      new Set(data.flatMap((item) => [item.child, item.parent])).forEach((name) => graph.push({ data: { id: name } }));

      // Add edges
      data.forEach((item) => graph.push({ data: { source: item.parent, target: item.child } }));

      return { graph, nodes };
   }

   /**
    * Extracts inheritance relationships for classes and interfaces.
    *
    * @template T
    *
    * @param {import('./types').NameableNode}   node - Target node to extract.
    *
    * @param {Map<string, T>}                   nodes - All nodes Map.
    *
    * @param {object[]}                         data - Parent / child relationships.
    */
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
