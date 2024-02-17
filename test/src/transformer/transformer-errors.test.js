// Tests various API errors for the `transformers` sub-path export.
/* eslint no-undef: "off" */

import { expect }          from 'vitest';

import {
   jsdocRemoveNodeByTags,
   jsdocTransformer,
   transformer }           from '../../../src/transformer/index.js';

describe('API Errors (transformers)', () =>
{
   describe('jsdocRemoveNodeByTags()', () =>
   {
      it(`throws - invalid 'tags'`, () =>
      {
         expect(() => jsdocRemoveNodeByTags(null)).toThrow(new TypeError(
          `[esm-d-ts] jsdocRemoveNodeByTags error: 'tags' is not a string or iterable list.`));
      });
   });

   describe('jsdocTransformer()', () =>
   {
      // Dummy function.
      const fn = () => void 0;

      it(`throws - invalid 'handler'`, () =>
      {
         expect(() => jsdocTransformer(null, fn, fn)).toThrow(new TypeError(
          `[esm-d-ts] jsdocTransformer error: 'handler' is not a function.`));
      });

      it(`throws - invalid 'postHandler'`, () =>
      {
         expect(() => jsdocTransformer(fn, null, fn)).toThrow(new TypeError(
          `[esm-d-ts] jsdocTransformer error: 'postHandler' is not a function.`));
      });

      it(`throws - invalid 'nodeTest'`, () =>
      {
         expect(() => jsdocTransformer(fn, fn, null)).toThrow(new TypeError(
          `[esm-d-ts] jsdocTransformer error: 'nodeTest' is not a function.`));
      });
   });

   describe('transformer()', () =>
   {
      // Dummy function.
      const fn = () => void 0;

      it(`throws - invalid 'handler'`, () =>
      {
         expect(() => transformer(null, fn)).toThrow(new TypeError(
          `[esm-d-ts] transformer error: 'handler' is not a function.`));
      });

      it(`throws - invalid 'postHandler'`, () =>
      {
         expect(() => transformer(fn, null)).toThrow(new TypeError(
          `[esm-d-ts] transformer error: 'postHandler' is not a function.`));
      });
   });
});
