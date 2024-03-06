declare function klona<T>(input: T): T;

/**
 * Provides common object manipulation utilities including depth traversal, obtaining accessors, safely setting values /
 * equality tests, and validation.
 */

/**
 * Freezes all entries traversed that are objects including entries in arrays.
 *
 * @param {object | []}   data - An object or array.
 *
 * @param {Set<string>}   [skipFreezeKeys] - A Set of strings indicating keys of objects to not freeze.
 *
 * @returns {object | []} The frozen object.
 */
declare function deepFreeze(data: object | [], skipFreezeKeys?: Set<string>): object | [];
/**
 * Recursively deep merges all source objects into the target object in place. Like `Object.assign` if you provide `{}`
 * as the target a copy is produced. If the target and source property are object literals they are merged.
 * Deleting keys is supported by specifying a property starting with `-=`.
 *
 * @param {object}      target - Target object.
 *
 * @param {...object}   sourceObj - One or more source objects.
 *
 * @returns {object}    Target object.
 */
declare function deepMerge(target?: object, ...sourceObj: object[]): object;
/**
 * Performs a naive depth traversal of an object / array. The data structure _must not_ have circular references.
 * The result of the callback function is used to modify in place the given data.
 *
 * @param {object | []}   data - An object or array.
 *
 * @param {(any) => any}  func - A callback function to process leaf values in children arrays or object members.
 *
 * @param {boolean}       modify - If true then the result of the callback function is used to modify in place
 *                                  the given data.
 *
 * @returns {*} The data object.
 */
declare function depthTraverse(data: object | [], func: Function, modify?: boolean): object | [];
/**
 * Returns a list of accessor keys by traversing the given object.
 *
 * @param {object}   data - An object to traverse for accessor keys.
 *
 * @returns {string[]} Accessor list.
 */
declare function getAccessorList(data: object): string[];
/**
 * Provides a method to determine if the passed in Svelte component has a getter & setter accessor.
 *
 * @param {object}   object - An object.
 *
 * @param {string}   accessor - Accessor to test.
 *
 * @returns {boolean} Whether the component has the getter and setter for accessor.
 */
declare function hasAccessor(object: object, accessor: string): boolean;
/**
 * Provides a method to determine if the passed in Svelte component has a getter accessor.
 *
 * @param {object}   object - An object.
 *
 * @param {string}   accessor - Accessor to test.
 *
 * @returns {boolean} Whether the component has the getter for accessor.
 */
declare function hasGetter(object: object, accessor: string): boolean;
/**
 * Returns whether the target is or has the given prototype walking up the prototype chain.
 *
 * @param {unknown}  target - Any target to test.
 *
 * @param {new (...args: any[]) => any} Prototype - Prototype function / class constructor to find.
 *
 * @returns {boolean} Target matches prototype.
 */
declare function hasPrototype(target: unknown, Prototype: new (...args: any[]) => any): boolean;
/**
 * Provides a method to determine if the passed in Svelte component has a setter accessor.
 *
 * @param {object}   object - An object.
 *
 * @param {string}   accessor - Accessor to test.
 *
 * @returns {boolean} Whether the component has the setter for accessor.
 */
declare function hasSetter(object: object, accessor: string): boolean;
/**
 * Tests for whether an object is async iterable.
 *
 * @param {unknown} value - Any value.
 *
 * @returns {boolean} Whether value is async iterable.
 */
declare function isAsyncIterable(value: unknown): value is AsyncIterable<unknown>;
/**
 * Tests for whether an object is iterable.
 *
 * @param {unknown} value - Any value.
 *
 * @returns {boolean} Whether object is iterable.
 */
declare function isIterable(value: unknown): value is Iterable<unknown>;
/**
 * Tests for whether object is not null, typeof object, and not an array.
 *
 * @param {unknown} value - Any value.
 *
 * @returns {boolean} Is it an object.
 */
declare function isObject(value: unknown): value is Record<string, unknown>;
/**
 * Tests for whether the given value is a plain object.
 *
 * An object is plain if it is created by either: `{}`, `new Object()` or `Object.create(null)`.
 *
 * @param {unknown} value - Any value
 *
 * @returns {boolean} Is it a plain object.
 */
declare function isPlainObject(value: unknown): value is JSONObject;
/**
 * Safely returns keys on an object or an empty array if not an object.
 *
 * @param {object} object - An object.
 *
 * @returns {string[]}  Object keys or empty array.
 */
declare function objectKeys(object: object): string[];
/**
 * Safely returns an objects size. Note for String objects unicode is not taken into consideration.
 *
 * @param {any} object - Any value, but size returned for object / Map / Set / arrays / strings.
 *
 * @returns {number} Size of object.
 */
declare function objectSize(object: any): any;
/**
 * Provides a way to safely access an objects data / entries given an accessor string which describes the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk.
 *
 * @param {object}   data - An object to access entry data.
 *
 * @param {string}   accessor - A string describing the entries to access with keys separated by `.`.
 *
 * @param {any}      [defaultValue] - (Optional) A default value to return if an entry for accessor is not found.
 *
 * @returns {object} The data object.
 */
declare function safeAccess(data: object, accessor: string, defaultValue?: any): any;
/**
 * Provides a way to safely batch set an objects data / entries given an array of accessor strings which describe the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk. If value is an object the accessor will be used to access a target value from `value` which is
 * subsequently set to `data` by the given operation. If `value` is not an object it will be used as the target
 * value to set across all accessors.
 *
 * @param {object}   data - An object to access entry data.
 *
 * @param {string[]} accessors - A string describing the entries to access.
 *
 * @param {any}      value - A new value to set if an entry for accessor is found.
 *
 * @param {SafeSetOperation}   [operation='set'] - Operation to perform including: 'add', 'div', 'mult', 'set',
 *        'set-undefined', 'sub'.
 *
 * @param {any}      [defaultAccessValue=0] - A new value to set if an entry for accessor is found.
 *
 * @param {boolean}  [createMissing=true] - If true missing accessor entries will be created as objects automatically.
 */
declare function safeBatchSet(
  data: object,
  accessors: string[],
  value: any,
  operation?: SafeSetOperation,
  defaultAccessValue?: any,
  createMissing?: boolean,
): void;
/**
 * Compares a source object and values of entries against a target object. If the entries in the source object match
 * the target object then `true` is returned otherwise `false`. If either object is undefined or null then false
 * is returned.
 *
 * @param {object}   source - Source object.
 *
 * @param {object}   target - Target object.
 *
 * @returns {boolean} True if equal.
 */
declare function safeEqual(source: object, target: object): boolean;
/**
 * Provides a way to safely set an objects data / entries given an accessor string which describes the
 * entries to walk. To access deeper entries into the object format the accessor string with `.` between entries
 * to walk.
 *
 * @param {object}   data - An object to access entry data.
 *
 * @param {string}   accessor - A string describing the entries to access.
 *
 * @param {any}      value - A new value to set if an entry for accessor is found.
 *
 * @param {SafeSetOperation}   [operation='set'] - Operation to perform including: 'add', 'div', 'mult', 'set',
 *        'set-undefined', 'sub'.
 *
 * @param {boolean}  [createMissing=true] - If true missing accessor entries will be created as objects
 *        automatically.
 *
 * @returns {boolean} True if successful.
 */
declare function safeSet(
  data: object,
  accessor: string,
  value: any,
  operation?: SafeSetOperation,
  createMissing?: boolean,
): boolean;
/**
 * Performs bulk setting of values to the given data object.
 *
 * @param {object}            data - The data object to set data.
 *
 * @param {Record<string, any>}  accessorValues - Object of accessor keys to values to set.
 *
 * @param {SafeSetOperation}  [operation='set'] - Operation to perform including: 'add', 'div', 'mult', 'set', 'sub';
 *        default (`set`).
 *
 * @param {boolean}           [createMissing=true] - If true missing accessor entries will be created as objects
 *        automatically.
 */
declare function safeSetAll(
  data: object,
  accessorValues: Record<string, any>,
  operation?: SafeSetOperation,
  createMissing?: boolean,
): void;
/**
 * Performs bulk validation of data given an object, `validationData`, which describes all entries to test.
 *
 * @param {object}                           data - The data object to test.
 *
 * @param {Record<string, ValidationEntry>}  validationData - Key is the accessor / value is a validation entry.
 *
 * @param {string}                           [dataName='data'] - Optional name of data.
 *
 * @returns {boolean} True if validation passes otherwise an exception is thrown.
 */
declare function validate(data: object, validationData?: Record<string, ValidationEntry>, dataName?: string): any;
/**
 * Validates all array entries against potential type and expected tests.
 *
 * @param {object}            data - The data object to test.
 *
 * @param {string}            accessor - A string describing the entries to access.
 *
 * @param {ValidationEntry}   entry - Validation entry object
 *
 * @param {string}            [dataName='data'] - Optional name of data.
 *
 * @returns {boolean} True if validation passes otherwise an exception is thrown.
 */
declare function validateArray(data: object, accessor: string, entry: ValidationEntry, dataName?: string): boolean;
/**
 * Validates data entry with a typeof check and potentially tests against the values in any given expected set.
 *
 * @param {object}            data - The object data to validate.
 *
 * @param {string}            accessor - A string describing the entries to access.
 *
 * @param {ValidationEntry}   entry - Validation entry.
 *
 * @param {string}            [dataName='data'] - Optional name of data.
 *
 * @returns {boolean} True if validation passes otherwise an exception is thrown.
 */
declare function validateEntry(data: object, accessor: string, entry: ValidationEntry, dataName?: string): boolean;
/**
 * Dispatches validation of data entry to string or array validation depending on data entry type.
 *
 * @param {object}            data - The data object to test.
 *
 * @param {string}            accessor - A string describing the entries to access.
 *
 * @param {ValidationEntry}   [entry] - A validation entry.
 *
 * @param {string}            [dataName='data'] - Optional name of data.
 *
 * @returns {boolean} True if validation passes otherwise an exception is thrown.
 */
declare function validateEntryOrArray(data: object, accessor: string, entry: ValidationEntry, dataName?: string): any;
/**
 * Defines the operation to perform for `safeSet`.
 */
type SafeSetOperation = 'add' | 'div' | 'mult' | 'set' | 'set-undefined' | 'sub';
/**
 * Provides data for a validation check.
 */
type ValidationEntry = {
  /**
   * Optionally tests with a typeof check.
   */
  type?: string;
  /**
   * The type of entry / variable to test.
   */
  test: 'array' | 'entry' | 'entry|array';
  /**
   * Optional array, function, or set of expected values to test against.
   */
  expected?: any[] | Function | Set<any>;
  /**
   * Optional message to include.
   */
  message?: string;
  /**
   * When false if the accessor is missing validation is skipped; default: true
   */
  required?: boolean;
  /**
   * When true and an error is thrown otherwise a boolean is returned; default: true
   */
  error?: boolean;
};
type Primitive = bigint | boolean | null | number | string | symbol | undefined;
type JSONValue = Primitive | JSONObject | JSONArray;
interface JSONObject {
  [key: string]: JSONValue;
}
interface JSONArray extends Array<JSONValue> {}

export {
  type JSONArray,
  type JSONObject,
  type JSONValue,
  type Primitive,
  type SafeSetOperation,
  type ValidationEntry,
  deepFreeze,
  deepMerge,
  depthTraverse,
  getAccessorList,
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
  safeBatchSet,
  safeEqual,
  safeSet,
  safeSetAll,
  validate,
  validateArray,
  validateEntry,
  validateEntryOrArray,
};
