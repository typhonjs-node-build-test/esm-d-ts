/**
 * A test interface.
 */
declare interface ITest {
  /** A test function */
  foo(): boolean;
}
/**
 * Namespace for testing jsdocImplementsImportType transformer  w/ `@inherits`.
 */
declare namespace NameSpace {
  /** Templated interface */
  interface ITest2<T> {
    bar(): T;
  }
}
/**
 * A test type alias.
 */
type TypeAlias = {
  /** A test property */
  bar?: boolean;
};

/**
 * A test class that implements ITest
 *
 * @implements {(import('./types').ITest)}
 * @implements {(import('./types').NameSpace.ITest2<boolean>)}
 */
declare class Test implements ITest, NameSpace.ITest2<boolean> {
  /**
   * Implementation for ITest.
   *
   * @returns {boolean}
   */
  foo(): boolean;
  /**
   * Implementation from ITest2.
   *
   * @returns {boolean}
   */
  bar(): boolean;
  /**
   * Tests setter accessor transformer to ensure argument matches the `@param` name.
   *
   * @param {boolean}  baz -
   */
  set baz(baz: boolean);
  /**
   * @returns {boolean}
   */
  get baz(): boolean;
}

export { type ITest, NameSpace, Test, type TypeAlias };
