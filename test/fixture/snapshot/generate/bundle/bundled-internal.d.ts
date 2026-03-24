/**
 * A basic named export to test `types` export condition for subpath.
 *
 * @type {string}
 */
declare const testTypesSubpath: string;

// This tests `bundleDTS` from internal source referencing the host package without it being installed. IE a local
// source repository.

/**
 * Local not exported alias.
 */
type testAlias = typeof testTypesSubpath;

/**
 * A basic named export to test `types` export condition.
 *
 * @type {string}
 */
declare const testTypesCondition: string;

export { testTypesCondition };
export type { testAlias };
