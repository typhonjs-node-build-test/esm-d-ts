// Note: Presently it appears there is a bug in Typescript 5.3.3 insofar that when creating declarations for a directory
// backed by a `index.mjs` file the resulting declaration will drop the re-export of the directory. See `../index.js`.

/**
 * A test of directory importing `index.mjs`.
 *
 * @type {string}
 */
export const dir2Test = 'A test of directory import';
