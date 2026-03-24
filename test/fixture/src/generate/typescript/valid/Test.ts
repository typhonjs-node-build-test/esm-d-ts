export class Test
{
   /**
    * A test of TS declaration generation.
    */
   foo(): boolean {
      return false;
   }

   // TODO: Evaluate jsdocRemoveNodeByTags transformer as it fails for some reason with TS files vs JS.
   // /**
   //  * Testing `@internal` stripping transformer.
   //  *
   //  * @internal
   //  */
   // notPublic() {}
}
