// This tests `bundleDTS` from internal source referencing the host package without it being installed. IE a local
// source repository.

import type { testTypesSubpath } from '@esm-d-ts-test-not-installed/org/subpath';

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

export { testTypesCondition, testAlias };
