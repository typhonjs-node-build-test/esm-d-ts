/**
 * Check if the given file path is a TS declaration file.
 *
 * @param {string}   filepath - Path to check.
 *
 * @returns {boolean} Returns if the given path is a TS declaration file.
 */
export function isDTSFile(filepath: string): boolean;
/**
 * Check if the given file path is a standard TS file.
 *
 * @param {string}   filepath - Path to check.
 *
 * @returns {boolean} Returns if the given path is a standard TS file.
 */
export function isTSFile(filepath: string): boolean;
/**
 * Check if the given file path is any supported TS file.
 *
 * @param {string}   filepath - Path to check.
 *
 * @returns {boolean} Returns if the given path is any supported TS file.
 */
export function isTSFileExt(filepath: string): boolean;
/**
 * A regex to test if a file path is a Typescript declaration.
 *
 * @type {RegExp}
 */
export const regexIsDTSFile: RegExp;
/**
 * A regex to test if a file path is a standard Typescript file.
 *
 * @type {RegExp}
 */
export const regexIsTSFile: RegExp;
/**
 * A regex to test if a file path is any supported Typescript file.
 *
 * @type {RegExp}
 */
export const regexIsTSFileExt: RegExp;
