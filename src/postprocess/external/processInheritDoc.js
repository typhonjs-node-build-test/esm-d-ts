import { ClassDeclaration }   from 'ts-morph';

const s_TAG_NAMES = new Set(['inheritdoc', 'inheritDoc']);

/**
 * @type {import('../../src/postprocess').ProcessorFunction}
 */
export function processInheritDoc({ Logger, inheritance })
{
   inheritance.depthFirstSearch((v, e, u, i, depth) =>
   {
      if (depth > 0)
      {
         const id = v.data('id');
         const node = inheritance.nodes.get(id);

         if (!node)
         {
            Logger.warn(`[processInheritDoc] ts-morph node for graph id '${id}' could not be retrieved.`);
            return;
         }

         // For now only classes are considered.
         if (!(node instanceof ClassDeclaration)) { return; }

         if (Logger.isVerbose)
         {
            Logger.verbose(
             `[processInheritDoc] Visited node: ${v.data('id')} at depth: ${depth} from parent: ${u.data('id')}`);
         }

         const classMethods = new Set();

         for (const method of node.getMethods())
         {
            if (hasInheritdoc(method.getJsDocs())) { classMethods.add(method); }
         }

         if (classMethods.size) { processClassMethods(node, classMethods, Logger); }
      }
   }, { directed: true });
}

// Internal implementation -------------------------------------------------------------------------------------------

/**
 * Helper to parse JSDoc tags from node for `@inheritDoc`.
 *
 * @param {import('ts-morph').JSDoc[]} jsdocs - All JSDoc nodes.
 *
 * @returns {boolean} Has inheritdoc tag.
 */
function hasInheritdoc(jsdocs)
{
   for (const jsdoc of jsdocs)
   {
      for (const tag of jsdoc.getTags())
      {
         if (s_TAG_NAMES.has(tag.getTagName())) { return true; }
      }
   }

   return false;
}

/**
 * Processes each class node traversing back through all parents to locate
 *
 * @param {ClassDeclaration}     node - Current class being processed.
 *
 * @param {Set<import('ts-morph').MethodSignature>} methods - Methods that have `@inheritdoc`.
 *
 * @param {import('../').Logger} Logger - Logger instance.
 */
function processClassMethods(node, methods, Logger)
{
   const isVerbose = Logger.isVerbose;

   if (isVerbose) { Logger.verbose(`[processInheritDoc] Processing class: ${node.getName()}`); }

   let parentNode = node;

   while ((parentNode = parentNode.getBaseClass()) !== void 0)
   {
      if (isVerbose) { Logger.verbose(`[processInheritDoc] Traversing parent class: ${parentNode.getName()}`); }

      for (const method of methods)
      {
         const parentMethod = parentNode.getMethod(method.getName());

         if (!parentMethod)
         {
            // TODO remove debug log
            // console.log(`! \tcould not find parent method: `, method.getName());
            continue;
         }

         const methodParameters = method.getParameters();
         const parentMethodParameters = parentMethod.getParameters();

         if (methodParameters.length !== parentMethodParameters.length)
         {
            Logger.warn(`[processInheritDoc] Parent class method parameter lengths do not match.`);
            continue;
         }

         for (let cntr = 0; cntr < methodParameters.length; cntr++)
         {
            const methodParam = methodParameters[cntr];
            const parentParam = parentMethodParameters[cntr];

            const methodParamType = methodParam.getType().getText(methodParam);
            const parentParamType = parentParam.getType().getText(parentParam);

            if (methodParamType !== parentParamType)
            {
               methodParam.setType(parentParamType);
               methods.delete(method);
            }
         }
      }
   }

   if (methods.size)
   {
      const methodNames = Array.from(methods).map((method) => method.getName()).join(', ');

      Logger.warn(`[processInheritDoc] Failed to find parent implementations for methods: ${methodNames}`);
   }
}
