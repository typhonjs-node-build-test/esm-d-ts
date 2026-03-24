// This tests generation from internal source referencing the host package without it being installed. IE a local source
// repository.
export * from '@esm-d-ts-test-not-installed/org';
export * from '@esm-d-ts-test-not-installed/org/subpath';
