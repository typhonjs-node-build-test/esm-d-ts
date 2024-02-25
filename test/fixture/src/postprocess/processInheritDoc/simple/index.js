/**
 * A class that has child classes.
 */
export class A
{
   /**
    * @param {boolean} a - A boolean.
    *
    * @param {string}  b - B string.
    */
   foo(a, b) {}
}

/**
 * @inheritDoc
 */
export class B extends A
{
   /**
    * @inheritDoc
    */
   foo(a, b) {}

   /**
    * No `@inheritDoc`.
    */
   bar() {}
}

/**
 * @inheritDoc
 */
export class C extends B
{
   /**
    * @inheritDoc
    */
   foo(a, b) {}
}
