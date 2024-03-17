export * from '#importsForTesting2';

/**
 * A basic named export to test `types` export condition.
 *
 * @type {string}
 */
declare const testTypesCondition: string;

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

export { testBasic, testTypesCondition, testTypings };
