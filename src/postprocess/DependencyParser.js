import {
   ClassDeclaration,
   InterfaceDeclaration,
   TypeAliasDeclaration,
   VariableDeclaration }   from 'ts-morph';

/**
 * Parses a bundled DTS file via a ts-morph source file for inheritance hierarchy data.
 */
export class DependencyParser
{
   /**
    * @param {import('ts-morph').SourceFile} sourceFile - DTS source file to parse.
    *
    * @param {Set<import('./').DependencyNodes>} typeSet - The declaration types to parse.
    *
    * @returns {{ graph: object[], nodes: Map<string, import('./').DependencyNodes> }} Inheritance graph and nodes.
    */
   static parse(sourceFile, typeSet)
   {
      const data = [];
      const graph = [];

      /** @type {Map<string, import('./').DependencyNodes>} */
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
               graph.push({ data: { id: nodeName, type: node.getKindName() } });
            }
         }
      });

      // Process any variable declarations.
      if (typeSet.has(VariableDeclaration))
      {
         for (const node of sourceFile.getVariableDeclarations())
         {
            const nodeName = node.getName();
            if (!nodes.has(nodeName)) { nodes.set(nodeName, node); }
            graph.push({ data: { id: nodeName, type: node.getKindName() } });
         }
      }

      // Process any type aliases.
      if (typeSet.has(TypeAliasDeclaration))
      {
         for (const node of sourceFile.getTypeAliases())
         {
            const nodeName = node.getName();
            if (!nodes.has(nodeName)) { nodes.set(nodeName, node); }
            graph.push({ data: { id: nodeName, type: node.getKindName() } });
         }
      }

      // Format graph data -------------------------------------------------------------------------------------------

      // Add nodes
      new Set(data.flatMap((item) => [
         { id: item.child, type: item.type },
         { id: item.parent, type: item.type }
      ])).forEach((node) => graph.push({ data: node }));

      // Add edges
      data.forEach((item) => graph.push({ data: { source: item.parent, target: item.child } }));

      return { graph, nodes };
   }

   /**
    * Extracts inheritance relationships for classes and interfaces.
    *
    * @template T
    *
    * @param {import('ts-morph').Constructor<import('ts-morph').Node> & { getName: () => string}}   node - Target node
    * to extract.
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

            data.push({ child: nodeName, parent: baseClassName, type: node.getKindName() });
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

               data.push({ child: nodeName, parent: baseInterfaceName, type: node.getKindName() });
            }
         }
      }
   }
}
