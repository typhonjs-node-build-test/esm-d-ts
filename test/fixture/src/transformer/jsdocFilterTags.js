/**
 * This source file tests defining an array and a Set to the filter tags. Both `@hidden` and `@ignore` methods will
 * be removed from the public API / declarations generated.
 */
export class JsdocFilterTags
{
   /**
    * @hidden
    */
   foo() {};

   /**
    * @ignore
    */
   bar() {};
}
