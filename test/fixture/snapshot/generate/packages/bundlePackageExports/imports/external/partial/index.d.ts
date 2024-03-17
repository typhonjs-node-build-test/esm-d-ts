export * from '@esm-d-ts-test/org';
export * from '#importsForTesting2';

/**
 * A basic named export to test `package.json` `types` property.
 *
 * @type {string}
 */
declare const testBasic: string;

/**
 * A basic named export to test `package.json` `typings` property.
 *
 * @type {string}
 */
declare const testTypings: string;

export { testBasic, testTypings };
