/**
 * Provides common object manipulation utility functions and TypeScript type guards.
 *
 * @packageDocumentation
 */

declare function klona<T>(input: T): T;

/**
 * Provides common object manipulation utility functions and TypeScript type guards.
 *
 * @packageDocumentation
 */

/**
 * Freezes all entries traversed that are objects including entries in arrays.
 *
 * @param data - An object or array.
 *
 * @param [options] - Options
 *
 * @param [options.skipKeys] - A Set of strings indicating keys of objects to not freeze.
 *
 * @returns The frozen object.
 *
 * @typeParam T - Type of data.
 */
declare function deepFreeze<T extends object | []>(
  data: T,
  {
    skipKeys,
  }?: {
    skipKeys?: Set<string>;
  },
): T;
/**
 * Recursively deep merges all source objects into the target object in place. Like `Object.assign` if you provide `{}`
 * as the target a shallow copy is produced. If the target and source property are object literals they are merged.
 *
 * Note: The output type is inferred, but you may provide explicit generic types as well.
 *
 * @param target - Target object.
 *
 * @param sourceObj - One or more source objects.
 *
 * @returns Target object.
 */
declare function deepMerge<T extends object, U extends object>(target: T, sourceObj: U): DeepMerge<T, [U]>;
declare function deepMerge<T extends object, U extends object, V extends object>(
  target: T,
  sourceObj1: U,
  sourceObj2: V,
): DeepMerge<T, [U, V]>;
declare function deepMerge<T extends object, U extends object[]>(target: T, ...sourceObj: U): DeepMerge<T, U>;
/**
 * Seals all entries traversed that are objects including entries in arrays.
 *
 * @param data - An object or array.
 *
 * @param [options] - Options
 *
 * @param [options.skipKeys] - A Set of strings indicating keys of objects to not seal.
 *
 * @returns The sealed object.
 *
 * @typeParam T - Type of data.
 */
declare function deepSeal<T extends object | []>(
  data: T,
  {
    skipKeys,
  }?: {
    skipKeys?: Set<string>;
  },
): T;
/**
 * Determine if the given object has a getter & setter accessor.
 *
 * @param object - An object.
 *
 * @param accessor - Accessor to test.
 *
 * @returns Whether the given object has the getter and setter for accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam K - Accessor key.
 */
declare function hasAccessor<T extends object, K extends string>(
  object: T,
  accessor: K,
): object is T & Record<K, unknown>;
/**
 * Determine if the given object has a getter accessor.
 *
 * @param object - An object.
 *
 * @param accessor - Accessor to test.
 *
 * @returns Whether the given object has the getter for accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam K - Accessor key.
 */
declare function hasGetter<T extends object, K extends string>(
  object: T,
  accessor: K,
): object is T & Record<K, unknown>;
/**
 * Returns whether the target is or has the given prototype walking up the prototype chain.
 *
 * @param target - Any target class / constructor function to test.
 *
 * @param Prototype - Class / constructor function to find.
 *
 * @returns Target matches prototype.
 *
 * @typeParam T - Prototype class / constructor.
 */
declare function hasPrototype<T extends new (...args: any[]) => any>(
  target: new (...args: any[]) => any,
  Prototype: T,
): target is T;
/**
 * Determine if the given object has a setter accessor.
 *
 * @param object - An object.
 *
 * @param accessor - Accessor to test.
 *
 * @returns Whether the given object has the setter for accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam K - Accessor key.
 */
declare function hasSetter<T extends object, K extends string>(
  object: T,
  accessor: K,
): object is T & Record<K, unknown>;
/**
 * Tests for whether an object is async iterable.
 *
 * @param value - Any value.
 *
 * @returns Whether value is async iterable.
 */
declare function isAsyncIterable(value: unknown): value is AsyncIterable<any>;
/**
 * Tests for whether an object is iterable.
 *
 * @param value - Any value.
 *
 * @returns Whether object is iterable.
 */
declare function isIterable(value: unknown): value is Iterable<any>;
/**
 * Tests for whether object is not null, typeof object, and not an array.
 *
 * @param value - Any value.
 *
 * @returns Is it an object.
 */
declare function isObject(value: unknown): value is Record<string, unknown>;
/**
 * Tests for whether the given value is a plain object.
 *
 * An object is plain if it is created by either: `{}`, `new Object()` or `Object.create(null)`.
 *
 * @param value - Any value
 *
 * @returns Is it a plain object.
 */
declare function isPlainObject(value: unknown): value is Record<string, unknown>;
/**
 * Safely returns keys on an object or an empty array if not an object.
 *
 * @param object - An object.
 *
 * @returns Object keys or empty array.
 */
declare function objectKeys(object: object): string[];
/**
 * Safely returns an objects size. Note for String objects Unicode is not taken into consideration.
 *
 * @param object - Any value, but size returned for object / Map / Set / arrays / strings.
 *
 * @returns Size of object.
 */
declare function objectSize(object: any): number;
/**
 * Provides a way to safely access an objects data / entries given an accessor string which describes the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk.
 *
 * @param data - An object to access entry data.
 *
 * @param accessor - A string describing the entries to access with keys separated by `.`.
 *
 * @param [defaultValue] - (Optional) A default value to return if an entry for accessor is not found.
 *
 * @returns The value referenced by the accessor.
 *
 * @typeParam T - Type of data.
 * @typeParam P - Accessor type.
 * @typeParam R - Return value / Inferred deep access type or any provided default value type.
 */
declare function safeAccess<T extends object, P extends string, R = DeepAccess<T, P>>(
  data: T,
  accessor: P,
  defaultValue?: DeepAccess<T, P> extends undefined ? R : DeepAccess<T, P>,
): DeepAccess<T, P> extends undefined ? R : DeepAccess<T, P>;
/**
 * Compares a source object and values of entries against a target object. If the entries in the source object match
 * the target object then `true` is returned otherwise `false`. If either object is undefined or null then false
 * is returned.
 *
 * Note: The source and target should be JSON objects.
 *
 * @param source - Source object.
 *
 * @param target - Target object.
 *
 * @param [options] - Options.
 *
 * @param [options.arrayIndex] - Set to `false` to exclude equality testing for array contents; default: `true`.
 *
 * @param [options.hasOwnOnly] - Set to `false` to include enumerable prototype properties; default: `true`.
 *
 * @returns True if equal.
 */
declare function safeEqual(
  source: object,
  target: object,
  options?: {
    arrayIndex?: boolean;
    hasOwnOnly?: boolean;
  },
): boolean;
/**
 * Returns an iterator of safe keys useful with {@link safeAccess} and {@link safeSet} by traversing the given object.
 *
 * Note: Keys are only generated for JSON objects; {@link Map} and {@link Set} are not indexed.
 *
 * @param data - An object to traverse for accessor keys.
 *
 * @param [options] - Options.
 *
 * @param [options.arrayIndex] - Set to `false` to exclude safe keys for array indexing; default: `true`.
 *
 * @param [options.hasOwnOnly] - Set to `false` to include enumerable prototype properties; default: `true`.
 *
 * @returns Safe key iterator.
 */
declare function safeKeyIterator(
  data: object,
  {
    arrayIndex,
    hasOwnOnly,
  }?: {
    arrayIndex?: boolean;
    hasOwnOnly?: boolean;
  },
): IterableIterator<string>;
/**
 * Provides a way to safely set an objects data / entries given an accessor string which describes the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk.
 *
 * @param data - An object to access entry data.
 *
 * @param accessor - A string describing the entries to access.
 *
 * @param value - A new value to set if an entry for accessor is found.
 *
 * @param [options] - Options.
 *
 * @param [options.operation] - Operation to perform including: `add`, `div`, `mult`, `set`, `set-undefined`, `sub`;
 *        default: `set`.
 *
 * @param [options.createMissing] - If `true` missing accessor entries will be created as objects automatically;
 *        default: `false`.
 *
 * @returns True if successful.
 */
declare function safeSet(
  data: object,
  accessor: string,
  value: any,
  {
    operation,
    createMissing,
  }?: {
    operation?: 'add' | 'div' | 'mult' | 'set' | 'set-undefined' | 'sub';
    createMissing?: boolean;
  },
): boolean;
/**
 * Utility type for `safeAccess`. Infers compound accessor strings in object T.
 */
type DeepAccess<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? DeepAccess<T[K], Rest>
    : undefined
  : P extends keyof T
    ? T[P]
    : undefined;
/**
 * Recursively merges multiple object types ensuring correct property resolution.
 *
 * This utility takes a target object `T` and applies a sequence of merges from `U` progressively combining their
 * properties while respecting key precedence. Later objects overwrite earlier ones, similar to `Object.assign`.
 *
 * @typeParam T - The base object type.
 * @typeParam U - A tuple of objects to be deeply merged with `T`.
 */
type DeepMerge<T extends object, U extends object[]> = U extends [infer First, ...infer Rest]
  ? DeepMerge<
      {
        [K in keyof (Omit<T, keyof First> & First)]: (Omit<T, keyof First> & First)[K];
      },
      Rest extends object[] ? Rest : []
    >
  : T;

export {
  deepFreeze,
  deepMerge,
  deepSeal,
  hasAccessor,
  hasGetter,
  hasPrototype,
  hasSetter,
  isAsyncIterable,
  isIterable,
  isObject,
  isPlainObject,
  klona,
  objectKeys,
  objectSize,
  safeAccess,
  safeEqual,
  safeKeyIterator,
  safeSet,
};
