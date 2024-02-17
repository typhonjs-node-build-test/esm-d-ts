// Tests various API errors for utilities in the `util` sub-path export.
/* eslint no-undef: "off" */

import { parse }                 from 'comment-parser';

import ts                        from 'typescript';

import {
   expect,
   vi }                          from 'vitest';

import {
   ESTreeParsedComment,
   logTSNode,
   parseImportType,
   parseImportTypesFromBlock }   from '#util';

describe('API Errors (util)', () =>
{
   describe('ESTreeParsedComment', () =>
   {
      const comment = `/**\n * Test description\n * @hidden\n * @ignore\n * @internal\n */`;

      it('removeTags() - invalid tagNames', () =>
      {
         const parsed = new ESTreeParsedComment(comment);

         expect(() => parsed.removeTags(false)).toThrow(new TypeError(
          `ESTreeParsedComment.removeTags error: 'tagNames' is not a string or iterable list of strings.`));
      });

      it('tags() - invalid tagNames', () =>
      {
         const parsed = new ESTreeParsedComment(comment);

         expect(() => parsed.tags(true).next()).toThrow(new TypeError(
          `ESTreeParsedComment.tags error: 'tagNames' is not a string or iterable list of strings.`));
      });
   });

   describe('logTSNode()', () =>
   {
      it('invalid TS Node', () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         logTSNode(false, 'info');

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog)).to.equal(
          `[["\\u001b[31m[esm-d-ts] [logTSNode] node is not a Typescript AST node.\\u001b[0m"]]`);
      });

      it('invalid log level', () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         // Invalid log level.
         logTSNode(ts.factory.createEmptyStatement(), 'bad');

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog)).to.equal(
          `[["\\u001b[31m[esm-d-ts] [logTSNode] logLevel 'bad' is not a valid log level.\\u001b[0m"]]`);
      });
   });

   describe('parseImportType()', () =>
   {
      it('`type` is not a string', () =>
      {
         expect(parseImportType()).to.be.undefined;
      });
   });

   describe('parseImportTypesFromBlock()', () =>
   {
      it('`block` is undefined', () =>
      {
         expect(parseImportTypesFromBlock({})).to.be.undefined;
      });

      it('`tag` is not a string', () =>
      {
         const block = parse('/** Test */')[0];

         expect(() => parseImportTypesFromBlock({ block, tag: false })).toThrow(new TypeError(
          `parseImportTypesFromBlock error: 'tag' is not a string.`));
      });

      it('`tag` is not a string', () =>
      {
         const block = parse('/** Test */')[0];

         expect(() => parseImportTypesFromBlock({ block, tag: 'param', first: 'bad' })).toThrow(new TypeError(
          `parseImportTypesFromBlock error: 'first' is not a boolean.`));
      });
   });
});
