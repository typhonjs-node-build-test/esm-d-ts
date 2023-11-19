import { ClassDeclaration }   from 'ts-morph';

const s_TAG_NAMES = new Set(['inheritdoc', 'inheritDoc']);

/**
 * Implements a postprocessor to support `@inheritDoc`. By making a depth first search across the inheritance graph
 * at every depth classes are processed for methods and constructor functions that have the `@inheritDoc` param. A
 * backward traversal is performed from the current class through parent inheritance to promote the types of the
 * parent class to child. `@inheritDoc` marked methods must have the same number of parameters as the parent
 * implementation. Warnings and generated and improperly formatted methods are skipped.
 *
 * This is necessary as Typescript / `tsc` does not support the `@inheritDoc` JSDoc tag and will mark the types for
 * all methods using it with `any`.
 *
 * You may enable `verbose` logging to see the graph traversal.
 *
 * @param {object} options - Options
 *
 * @param {import('@typhonjs-build-test/esm-d-ts/util').Logger} options.Logger - Logger class.
 *
 * @param {import('../GraphAnalysis.js').GraphAnalysis<import('../').DependencyNodes>} options.dependencies -
 *        Dependency graph
 */
export function processInheritDoc({ Logger, dependencies })
{
   dependencies.dfs((v, e, u, i, depth) =>
   {
      if (depth > 0)
      {
         const id = v.data('id');
         const node = dependencies.nodes.get(id);

         if (!node)
         {
            Logger.warn(`[processInheritDoc] ts-morph node for graph id '${id}' could not be retrieved.`);
            return;
         }

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

         let classCtor;

         // Find any constructor and test if it has `@inheritDoc`.
         const maybeCtor = getConstructor(node);
         if (maybeCtor && hasInheritdoc(maybeCtor.getJsDocs())) { classCtor = maybeCtor; }

         if (classMethods.size || classCtor) { processClass(node, classMethods, classCtor, Logger); }
      }
   }, { directed: true, type: new Set(['ClassDeclaration']) });
}

// Internal implementation -------------------------------------------------------------------------------------------

/**
 * Gets the first constructor of a class declaration. Since this is for Javascript there can be only one. ⚔️
 *
 * @param {ClassDeclaration}  classDeclaration - ClassDeclaration.
 *
 * @returns {import('ts-morph').ConstructorDeclaration} Any class constructor.
 */
function getConstructor(classDeclaration)
{
   const constructors = classDeclaration.getConstructors();
   return constructors.length > 0 ? constructors[0] : void 0;
}

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
 * Processes each class node traversing back through all parents to applying the types for method parameters upwards.
 *
 * @param {ClassDeclaration}     node - Current class being processed.
 *
 * @param {Set<import('ts-morph').MethodSignature>} methods - Methods that have `@inheritdoc`.
 *
 * @param {import('ts-morph').ConstructorDeclaration} classCtor - Any constructor declaration.
 *
 * @param {import('@typhonjs-build-test/esm-d-ts/util').Logger} Logger - Logger instance.
 */
function processClass(node, methods, classCtor, Logger)
{
   const isVerbose = Logger.isVerbose;

   if (isVerbose) { Logger.verbose(`[processInheritDoc] Processing class: ${node.getName()}`); }

   let parentNode = node;

   while ((parentNode = parentNode.getBaseClass()) !== void 0)
   {
      if (isVerbose) { Logger.verbose(`[processInheritDoc] Traversing parent class: ${parentNode.getName()}`); }

      if (classCtor)
      {
         const parentClassCtor = getConstructor(parentNode);
         if (parentClassCtor)
         {
            const ctorParameters = classCtor.getParameters();
            const parentCtorParameters = parentClassCtor.getParameters();

            if (ctorParameters.length !== parentCtorParameters.length)
            {
               Logger.warn(`[processInheritDoc] Parent class constructor parameter lengths do not match.`);
            }
            else
            {
               for (let cntr = 0; cntr < ctorParameters.length; cntr++)
               {
                  const ctorParam = ctorParameters[cntr];
                  const parentCtorParam = parentCtorParameters[cntr];

                  const ctorParamType = ctorParam.getType().getText(ctorParam);
                  const parentParamType = parentCtorParam.getType().getText(parentCtorParam);

                  if (ctorParamType !== parentParamType)
                  {
                     ctorParam.setType(parentParamType);
                     classCtor = void 0;
                  }
               }
            }
         }
      }

      for (const method of methods)
      {
         const parentMethod = parentNode.getMethod(method.getName());

         if (!parentMethod) { continue; }

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
