import { ClassDeclaration }   from 'ts-morph';

const s_TAG_NAMES = new Set(['inheritdoc', 'inheritDoc']);

/**
 * @type {import('../../src/post-process').ProcessorFunction}
 */
export function processorInheritDoc({ inheritance })
{
   inheritance.depthFirstSearch((v, e, u, i, depth) =>
   {
      if (depth > 0)
      {
         const id = v.data('id');
         const node = inheritance.nodes.get(id);

         if (!node)
         {
            // TODO: Warning log message.
            return;
         }

         if (!(node instanceof ClassDeclaration))
         {
            return;
         }

         console.log(`Visited node: ${v.data('id')} at depth: ${depth} from parent: ${u.data('id')}`);

         const isClassNode = node instanceof ClassDeclaration;
         const classMethods = new Set();

         for (const method of node.getMethods())
         {
            if (hasInheritdoc(method.getJsDocs()))
            {
               if (isClassNode) { classMethods.add(method); }
            }
            else
            {
               // console.log(`! no inheritdoc tag; method name: `, method.getName());
            }
         }

         if (isClassNode && classMethods.size) { processClassMethods(node, classMethods); }
      }
   }, { directed: true });
}

// Internal implementation -------------------------------------------------------------------------------------------

/**
 * @param {import('ts-morph').JSDoc[]} jsdocs -
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
 * @param {ClassDeclaration}     node - Current class being processed.
 *
 * @param {Set<import('ts-morph').MethodSignature>} methods - Methods that have `@inheritdoc`.
 */
function processClassMethods(node, methods)
{
   console.log(`! Processing class: `, node.getName());

   let parentNode = node;

   while ((parentNode = parentNode.getBaseClass()) !== void 0)
   {
      console.log(`! Processing parent: `, parentNode.getName());
      for (const method of methods)
      {
         const parentMethod = parentNode.getMethod(method.getName());

         if (!parentMethod)
         {
            console.log(`! \tcould not find parent method: `, method.getName());
            continue;
         }

         const methodParameters = method.getParameters();
         const parentMethodParameters = parentMethod.getParameters();

         if (methodParameters.length !== parentMethodParameters.length)
         {
            console.log(`! \tparent method lengths do not match`);
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
}
