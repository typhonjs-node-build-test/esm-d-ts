// Tests when a package doesn't export types and `bundlePackageExports` is enabled.

export * from 'esm-d-ts-test-no-types';

/**
 * Tests when a package doesn't export types and `bundlePackageExports` is enabled. `esm-d-ts-test-no-types`.
 *
 * @type {string}
 */
export const noPackageTypes = 'A test';
