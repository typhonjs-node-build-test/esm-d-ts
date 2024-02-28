// `./dir2` has a backing `index.mjs` and TSC seems to have a problem connecting it in the main `index.d.mts` emitted.
// Everything works for directory references via `index.js` and I have tried many variations of settings. I think it's
// a TSC bug. Seen in Typescript 5.3.3

export * from './dir1';
export * from './dir2';
