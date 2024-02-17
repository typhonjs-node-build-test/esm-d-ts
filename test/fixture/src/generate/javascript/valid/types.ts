/**
 * A test interface.
 */
export declare interface ITest {
   /** A test function */
   foo(): boolean;
}

/**
 * Namespace for testing jsdocImplementsImportType transformer  w/ `@inherits`.
 */
export declare namespace NameSpace {
   /** Templated interface */
   export interface ITest2<T> {
      bar(): T;
   }
}

/**
 * A test type alias.
 */
export type TypeAlias = {
   /** A test property */
   bar?: boolean;
}
