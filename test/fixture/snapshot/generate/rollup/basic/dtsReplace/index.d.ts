/**
 * A test interface.
 */
declare interface IReplacedTest {
  /** A test function */
  foo(): boolean;
}
/**
 * Namespace for testing jsdocImplementsImportType transformer  w/ `@inherits`.
 */
declare namespace NameSpace {
  /** Templated interface */
  interface IReplacedTest2<T> {
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
 * A test class that implements IReplacedTest
 *
 * @implements {(import('./types').IReplacedTest)}
 * @implements {(import('./types').NameSpace.IReplacedTest2<boolean>)}
 */
declare class Test implements IReplacedTest, NameSpace.IReplacedTest2<boolean> {
  /**
   * Implementation for IReplacedTest.
   *
   * @returns {boolean}
   */
  foo(): boolean;
  /**
   * Implementation from IReplacedTest2.
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

export { type IReplacedTest, NameSpace, Test, type TypeAlias };
