/**
 * Tests for whether an object is iterable.
 *
 * @param {*} value - Any value.
 *
 * @returns {boolean} Whether object is iterable.
 */
export function isIterable(value)
{
   if (value === null || value === void 0 || typeof value !== 'object') { return false; }

   return typeof value[Symbol.iterator] === 'function';
}

/**
 * Tests for whether object is not null and a typeof object.
 *
 * @param {*} value - Any value.
 *
 * @returns {boolean} Is it an object.
 */
export function isObject(value)
{
   return value !== null && typeof value === 'object';
}
