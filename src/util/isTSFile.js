import { isFile } from '@typhonjs-utils/file-util';

/**
 * A regex to test if a file path is a Typescript declaration.
 *
 * @type {RegExp}
 */
export const regexIsDTSFile = /\.d\.(cts|ts|mts)$/;

/**
 * A regex to test if a file path is a standard Typescript file.
 *
 * @type {RegExp}
 */
export const regexIsTSFile = /^(?!.*\.d\.(ts|cts|mts)$).*\.(ts|cts|mts)$/;

/**
 * A regex to test if a file path is any supported Typescript file.
 *
 * @type {RegExp}
 */
export const regexIsTSFileExt = /^(?!.*\.d\.(ts|cts|mts)$).*\.(ts|cts|ctsx|mts|mtsx|jsx|tsx)$/;

/**
 * Check if the given file path is a TS declaration file.
 *
 * @param {string}   filepath - Path to check.
 *
 * @returns {boolean} Returns if the given path is a TS declaration file.
 */
export function isDTSFile(filepath)
{
   return isFile(filepath) && regexIsDTSFile.test(filepath);
}

/**
 * Check if the given file path is a standard TS file.
 *
 * @param {string}   filepath - Path to check.
 *
 * @returns {boolean} Returns if the given path is a standard TS file.
 */
export function isTSFile(filepath)
{
   return isFile(filepath) && regexIsTSFile.test(filepath);
}

/**
 * Check if the given file path is any supported TS file.
 *
 * @param {string}   filepath - Path to check.
 *
 * @returns {boolean} Returns if the given path is any supported TS file.
 */
export function isTSFileExt(filepath)
{
   return isFile(filepath) && regexIsTSFileExt.test(filepath);
}
