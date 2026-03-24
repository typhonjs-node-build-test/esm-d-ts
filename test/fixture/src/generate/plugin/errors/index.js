// This is just test code for event callbacks. Because `index.js` is the entry point the Typescript plugin is not
// loaded.

import './lexer.ts';

/**
 * @type {number}
 */
let foo = 0;

// Creates a diagnostic error to test `compile:diagnostic:filter' event callback.
foo = 'bad';

export { foo };
