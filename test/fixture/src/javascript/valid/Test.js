/**
 * A test class that implements ITest
 *
 * @implements {(import('./types').ITest)}
 * @implements {(import('./types').NameSpace.ITest2<boolean>)}
 */
export class Test
{
   static #removedByTransformer = `TSC doesn't properly handle static private members.`;

   /**
    * Implementation for ITest.
    *
    * @returns {boolean}
    */
   foo() { return true; }

   /**
    * Implementation from ITest2.
    *
    * @returns {boolean}
    */
   bar() { return false; }

   /**
    * @returns {boolean}
    */
   get baz() { return false; }

   /**
    * Tests setter accessor transformer to ensure argument matches the `@param` name.
    *
    * @param {boolean}  baz -
    */
   set baz(baz) { /* no-op */ }

   /**
    * Testing `@internal` stripping transformer.
    *
    * @internal
    */
   notPublic() {}
}
