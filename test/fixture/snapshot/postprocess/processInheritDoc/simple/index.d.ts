/**
 * A class that has child classes.
 */
declare class A {
  /**
   * @param {boolean} a - A boolean.
   *
   * @param {string}  b - B string.
   */
  foo(a: boolean, b: string): void;
}
/**
 * @inheritDoc
 */
declare class B extends A {
  /**
   * @inheritDoc
   */
  foo(a: any, b: any): void;
  /**
   * No `@inheritDoc`.
   */
  bar(): void;
}
/**
 * @inheritDoc
 */
declare class C extends B {}

export { A, B, C };
