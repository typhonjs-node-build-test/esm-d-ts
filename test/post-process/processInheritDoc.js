/**
 * @type {import('../../src/post-process').ProcessorFunction}
 */
export function processorInheritDoc({ inheritance })
{
   inheritance.dfs((v, e, u, i, depth) =>
   {
      if (depth === 0)
      {
         console.log(`Visited node: ${v.data('id')} at depth: ${depth}`);
      }
      else
      {
         console.log(`Visited node: ${v.data('id')} at depth: ${depth} from parent: ${u.data('id')}`);
      }
   });
}
