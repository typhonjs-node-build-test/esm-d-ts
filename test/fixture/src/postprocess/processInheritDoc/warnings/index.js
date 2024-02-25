/**
 * A class that has a child class with warnings / @inheritDoc issues.
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
    * Warning no parent `constructor`.
    *
    * @inheritDoc
    */
   constructor(a, b) { super(); }

   /**
    * Warning parent `foo` has two parameters.
    *
    * @inheritDoc
    */
   foo(a) {}

   /**
    * Warning no parent `bar` method.
    *
    * @inheritDoc
    */
   bar() {}
}

export class C extends B {
   /**
    * Warning as parent `constructor` has two parameters.
    *
    * @inheritDoc
    */
   constructor(a) { super(); }
}
