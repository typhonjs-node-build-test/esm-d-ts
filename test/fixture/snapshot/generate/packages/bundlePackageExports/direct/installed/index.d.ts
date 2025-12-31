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
 * Asserts that a value is an object, not null, and not an array.
 *
 * Unlike {@link isObject}, this function does **not** narrow the value to a generic indexable structure. Instead, it
 * preserves the **existing** static type of the variable. This makes it ideal for validating option objects or
 * interface-based inputs where all properties may be optional.
 *
 * Use this function when:
 * ```
 *   - You expect a value to be an object at runtime, **and**
 *   - You want to keep its compile-time type intact after validation.
 * ```
 *
 * @example
 * interface Options { flag?: boolean; value?: number; }
 *
 * function run(opts: Options = {}) {
 *   assertObject(opts, `'opts' is not an object.`);  // `opts` remains `Options`, not widened or reduced.
 *   opts.value;                                      // Fully typed access remains available.
 * }
 *
 * @throws {TypeError} if the value is null, non-object, or an array.
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 */
declare function assertObject<T>(value: T, errorMsg?: string): asserts value is T & object;
/**
 * Asserts that a value is a plain object, not null, and not an array.
 *
 * Unlike {@link isPlainObject}, this function does **not** narrow the value to a generic indexable structure. Instead,
 * it preserves the **existing** static type of the variable. This makes it ideal for validating option objects or
 * interface-based inputs where all properties may be optional.
 *
 * Use this function when:
 * ```
 *   - You expect a value to be a plain object at runtime, **and**
 *   - You want to keep its compile-time type intact after validation.
 * ```
 *
 * @example
 * interface Options { flag?: boolean; value?: number; }
 *
 * function run(opts: Options = {}) {
 *   assertPlainObject(opts, `'opts' is not a plain object.`); // `opts` remains `Options`, not widened or reduced.
 *   opts.value;                                               // Fully typed access remains available.
 * }
 *
 * @throws {TypeError} if the value is null, non-object, or an array.
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 */
declare function assertPlainObject<T>(value: T, errorMsg?: string): asserts value is T & object;
/**
 * Asserts that a value is a non-null, non-array object that can be treated as a string-keyed record.
 *
 * Unlike {@link isRecord}, this function does **not** narrow the value to a generic indexable structure. Instead,
 * it preserves the **existing** static type of the variable. This makes it ideal for validating option objects or
 * interface-based inputs where all properties may be optional.
 *
 * Use this function when:
 * ```
 *   - You need to reject `null`, primitives, or arrays at runtime.
 *   - You want to safely treat the value as a record, **without losing its compile-time shape**.
 * ```
 *
 * @example
 * interface Options { flag?: boolean; value?: number; }
 *
 * function run(opts: Options = {}) {
 *   assertPlainObject(opts, `'opts' is not a record object.`);   // `opts` remains `Options`, not widened or reduced.
 *   opts.value;                                                  // Fully typed access remains available.
 * }
 *
 * @throws {TypeError} if the value is null, non-object, or an array.
 *
 * @param value - The value to validate.
 *
 * @param errorMsg - Optional message used for the thrown TypeError.
 */
declare function assertRecord<T>(value: T, errorMsg?: string): asserts value is T & Record<string, unknown>;
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
 * Ensures that a value is a *non-empty async iterable*.
 * ```
 * - If the value is not async iterable, `undefined` is returned.
 * - If the async iterable yields no items, `undefined` is returned.
 * - If it yields at least one item, a fresh async iterable is returned which yields the first peeked item followed by
 * the rest, preserving behavior for one-shot async generators.
 * ```
 *
 * Supports both AsyncIterable<T> and (optionally) synchronous Iterable<T>.
 *
 * @param value - The value to test as an async iterable.
 *
 * @returns A non-empty async iterable, or `undefined`.
 */
declare function ensureNonEmptyAsyncIterable<T>(
  value: AsyncIterable<T> | Iterable<T> | null | undefined,
): Promise<AsyncIterable<T> | undefined>;
/**
 * Ensures that a given value is a *non-empty iterable*.
 * ```
 * - If the value is not iterable → returns `undefined`.
 * - If the value is an iterable but contains no entries → returns `undefined`.
 * - If the value is a non-empty iterable → returns a fresh iterable (generator) that yields the first peeked value
 * followed by the remaining values. This guarantees restartable iteration even when the original iterable is a
 * one-shot generator.
 * ```
 *
 * This function is ideal when you need a safe, non-empty iterable for iteration but cannot consume or trust the
 * original iterable’s internal iterator state.
 *
 * @param value - The value to inspect.
 *
 * @returns A restartable iterable containing all values, or `undefined` if the input was not iterable or contained no
 *          items.
 *
 * @example
 * const iter = ensureNonEmptyIterable(['a', 'b']);
 * // `iter` is an iterable yielding 'a', 'b'.
 *
 * const empty = ensureNonEmptyIterable([]);
 * // `undefined`
 *
 * const gen = ensureNonEmptyIterable((function*(){ yield 1; yield 2; })());
 * // Safe: returns an iterable yielding 1, 2 without consuming the generator.
 */
declare function ensureNonEmptyIterable<T>(value: Iterable<T> | null | undefined): Iterable<T> | undefined;
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
declare function hasAccessor<T extends object, K extends keyof T>(
  object: T,
  accessor: K,
): object is T & {
  [P in K]: T[P];
};
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
declare function hasGetter<T extends object, K extends keyof T>(
  object: T,
  accessor: K,
): object is T & {
  [P in K]: T[P];
};
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
declare function hasSetter<T extends object, K extends keyof T>(
  object: T,
  accessor: K,
): object is T & {
  [P in K]: T[P];
};
/**
 * Tests for whether an _object_ is async iterable.
 *
 * @param value - Any value.
 *
 * @returns Whether value is async iterable.
 */
declare function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T>;
/**
 * Tests for whether an _object_ is iterable.
 *
 * Note: Excludes `strings` in iterable test even though they are technically iterable.
 *
 * @param value - Any value.
 *
 * @returns Whether object is iterable.
 */
declare function isIterable<T>(value: unknown): value is Iterable<T>;
declare function isObject<T extends object>(value: T): value is T;
/**
 * Runtime check for whether a value is an object:
 * ```
 * - typeof === 'object'
 * - not null
 * - not an array
 * ```
 *
 * This function performs **type narrowing**. If the check succeeds, TypeScript refines the type of `value` to `T`,
 * allowing known object types (interfaces, classes, mapped structures) to retain their original shape.
 *
 * Type Behavior:
 * - When called with a value that already has a specific object type (interface or shaped object), that type is
 *   preserved after narrowing. Property access remains fully typed.
 *
 * - When called with `unknown`, `any`, or an untyped object literal, `T` becomes `object`, ensuring only that a
 *   non-null object exists. No indexing or deep property inference is provided in this case.
 *
 * In other words:
 * ```
 * - Known object type   → remains that type (preferred behavior)
 * - Unknown / untyped   → narrows only to `object`
 * ```
 *
 * Use this when you want runtime object validation **and** want to preserve typing when a value is already known to be
 * a specific object type. If you instead need to **retain** the declared type regardless of narrowing, use
 * {@link assertObject}. If you need indexable key / value access use a dedicated record check such as
 * {@link isRecord} or {@link isPlainObject}.
 *
 * @param value - Any value to check.
 *
 * @returns True if the value is a non-null object and not an array.
 */
declare function isObject(value: unknown): value is object;
declare function isPlainObject<T extends object>(value: T): value is T;
/**
 * Determines whether a value is a **plain** object.
 *
 * A plain object is one whose prototype is either:
 *   - `Object.prototype` (created via `{}` or `new Object()`)
 *   - `null` (created via `Object.create(null)`)
 *
 * This excludes arrays, functions, class instances, DOM objects, and any object with a custom prototype. In other
 * words, this function detects JSON-like dictionary objects rather than structural or callable object types.
 *
 * Type Behavior:
 * - If the input already has a known object type `T`, that type is preserved after narrowing.
 * - If the input is `unknown` or untyped the result narrows to `Record<string, unknown>` allowing safe keyed access.
 *
 * Useful when validating configuration objects, cloning or merging data, performing deep equality, or working with
 * structured JSON where non-plain / prototype values would be considered invalid.
 *
 * @example
 * const a = { x: 1 };
 * isPlainObject(a);   // true
 *
 * class Foo {}
 * isPlainObject(new Foo()); // false
 *
 * @example
 * let data: unknown = getValue();
 * if (isPlainObject(data)) {
 *   data.foo;         // ok — key is `unknown`, but structure is guaranteed.
 * }
 *
 * @param value - Any value to evaluate.
 *
 * @returns True if the value is a plain object with no special prototype.
 */
declare function isPlainObject(value: unknown): value is Record<string, unknown>;
/**
 * Checks whether a value is a generic key / value object / `Record<string, unknown>`.
 *
 * A record in this context means:
 *   - `typeof value === 'object'`
 *   - value is not `null`
 *   - value is not an array
 *
 * Unlike {@link isObject}, this function does **not** attempt to preserve the original object type. All successful
 * results narrow to `Record<string, unknown>` making the returned value safe for key-indexed access but without any
 * knowledge of property names or expected value types.
 *
 * This is useful when processing untyped JSON-like data structures, dynamic configuration blocks, response bodies,
 * or any case where a dictionary-style object is expected rather than a typed interface value.
 *
 * Contrast With:
 * - {@link isObject} → preserves known object types where possible; use when typing should remain intact.
 * - {@link isPlainObject} → narrows to plain JSON objects only (no prototypes, no class instances).
 * - `isRecord()` → always narrows to a dictionary-style record for keyed lookup.
 *
 * @param value - Any value to test.
 *
 * @returns True if the value is an object that is neither null nor an array.
 */
declare function isRecord(value: unknown): value is Record<string, unknown>;
/**
 * Safely returns keys on an object or an empty array if not an object.
 *
 * @param object - An object.
 *
 * @returns Object keys or empty array.
 */
declare function objectKeys<T extends object>(object: T): (keyof T)[];
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
declare function safeEqual<T extends object>(
  source: T,
  target: object,
  options?: {
    arrayIndex?: boolean;
    hasOwnOnly?: boolean;
  },
): target is T;
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
  assertObject,
  assertPlainObject,
  assertRecord,
  deepFreeze,
  deepMerge,
  deepSeal,
  ensureNonEmptyAsyncIterable,
  ensureNonEmptyIterable,
  hasAccessor,
  hasGetter,
  hasPrototype,
  hasSetter,
  isAsyncIterable,
  isIterable,
  isObject,
  isPlainObject,
  isRecord,
  klona,
  objectKeys,
  objectSize,
  safeAccess,
  safeEqual,
  safeKeyIterator,
  safeSet,
};
