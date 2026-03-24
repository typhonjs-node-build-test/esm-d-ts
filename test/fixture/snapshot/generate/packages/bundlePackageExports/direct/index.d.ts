/**
 * A basic named export to test `types` export condition.
 *
 * @type {string}
 */
declare const testTypesCondition: string;

/**
 * A basic named export to test `types` export condition for subpath.
 *
 * @type {string}
 */
declare const testTypesSubpath: string;

/**
 * A basic named export to test `package.json` `types` property.
 *
 * @type {string}
 */
declare const testBasic: string;

/**
 * A basic named export to test default path `index.d.ts` discovery with `checkDefaultPath` option.
 *
 * @type {string}
 */
declare const testDefault: string;

export { testBasic, testDefault, testTypesCondition, testTypesSubpath };
