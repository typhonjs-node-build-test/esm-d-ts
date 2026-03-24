// Tests when a package doesn't export types and `bundlePackageExports` is enabled.
// Pre TS 5.4 the export of `esm-d-ts-test-no-types` is not represented in the declarations. 5.4+ it is.

export * from 'esm-d-ts-test-no-types';

/**
 * Tests when a package doesn't export types and `bundlePackageExports` is enabled. `esm-d-ts-test-no-types`.
 *
 * @type {string}
 */
export const noPackageTypes = 'A test';
