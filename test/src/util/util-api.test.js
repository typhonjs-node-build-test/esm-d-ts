// Tests various utilities in the `util` sub-path export that are not 100% covered in normal operation.
/* eslint no-undef: "off" */

import { parse }                 from 'comment-parser';

import {
   expect,
   vi }                          from 'vitest';

import ts                        from 'typescript';

import {
   ESTreeParsedComment,
   isDTSFile,
   isTSFileExt,
   logTSNode,
   parseImportTypesFromBlock }   from '#util';

describe('`util` exports', () =>
{
   describe('ESTreeParsedComment', () =>
   {
      const comment = `/**\n * Test description\n * @hidden\n * @ignore\n * @internal\n */`;

      it('getter `ast` - is defined', () =>
      {
         const parsed = new ESTreeParsedComment(comment);

         expect(parsed.ast).toBeTypeOf('object');
         expect(parsed.ast.description).toEqual('Test description');
      });

      it('removeTags() - removes all', () =>
      {
         const parsed = new ESTreeParsedComment(comment);

         expect(parsed.ast.tags.length).toEqual(3);

         parsed.removeTags();

         expect(parsed.ast.tags.length).toEqual(0);
      });

      it('removeTags() - remove specific tags (list)', () =>
      {
         const parsed = new ESTreeParsedComment(comment);

         expect(parsed.ast.tags.length).toEqual(3);

         parsed.removeTags(['hidden', 'internal']);

         expect(parsed.ast.tags.length).toEqual(1);

         expect([...parsed.tags()].map((entry) => entry.tag)).toEqual(['ignore']);
      });

      it('removeTags() - removes specific tag (string)', () =>
      {
         const parsed = new ESTreeParsedComment(comment);

         expect(parsed.ast.tags.length).toEqual(3);

         parsed.removeTags('hidden');

         expect(parsed.ast.tags.length).toEqual(2);

         expect([...parsed.tags()].map((entry) => entry.tag)).toEqual(['ignore', 'internal']);
      });

      it('tags() - iterate specific tags (list)', () =>
      {
         const parsed = new ESTreeParsedComment(comment);

         expect(parsed.ast.tags.length).toEqual(3);

         const result = [...parsed.tags(['ignore', 'internal'])];

         expect(result.map((entry) => entry.tag)).toEqual(['ignore', 'internal']);
      });

      it('tags() - iterate specific tag (string)', () =>
      {
         const parsed = new ESTreeParsedComment(comment);

         expect(parsed.ast.tags.length).toEqual(3);

         const result = [...parsed.tags('hidden')];

         expect(result.map((entry) => entry.tag)).toEqual(['hidden']);
      });

      it('toString()', () =>
      {
         const parsed = new ESTreeParsedComment(comment);

         expect(parsed.toString()).toEqual(comment);
      });
   });

   describe('isDTSFile', () =>
   {
      it('valid result (DTS file)', () => expect(isDTSFile('./src/generator/index.d.ts')).toBe(true));

      it('valid result (not DTS file)', () => expect(isDTSFile('./src/generator/index.js')).toBe(false));
   });

   describe('isTSFileExt', () =>
   {
      it('valid result (DTS file is false)', () => expect(isTSFileExt('./src/generator/index.d.ts')).toBe(false));

      it('valid result (not TS file)', () => expect(isTSFileExt('./src/generator/index.js')).toBe(false));

      it('valid result (is TS file)', () =>
       expect(isTSFileExt('./test/fixture/src/generate/typescript/valid/index.ts')).toBe(true));
   });

   describe('logTSNode()', () =>
   {
      it('logs node', async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         // Creates a TS AST node for:`.
         //
         // export class Test
         // {
         //    foo(): boolean { return true; }
         // }

         const node = ts.factory.createClassDeclaration(
          [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
          ts.factory.createIdentifier('Test'),
          void 0,
          void 0,
          [ts.factory.createMethodDeclaration(
           void 0,
           void 0,
           ts.factory.createIdentifier('foo'),
           void 0,
           void 0,
           [],
           ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
           ts.factory.createBlock(
            [ts.factory.createReturnStatement(ts.factory.createTrue())],
            false
           )
          )]
         );

         logTSNode(node, 'info');

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog)).to.equal(
          '[["\\u001b[32m[esm-d-ts] export class Test {\\n    foo(): boolean { return true; }\\n}\\u001b[0m"]]');
      });
   });

   describe('parseImportTypesFromBlock()', () =>
   {
      const comment = `/**\n * @param {import('one').One} test -\n * @param {import('two').Two} test -\n */`;

      it('returns all', async () =>
      {
         const block = parse(comment)[0];

         const result = parseImportTypesFromBlock({ block, tag: 'param' });

         expect(result).toEqual([
            { identFull: 'One', identImport: 'One', module: 'one' },
            { identFull: 'Two', identImport: 'Two', module: 'two' }
         ]);
      });

      it('returns only first', () =>
      {
         const block = parse(comment)[0];

         const result = parseImportTypesFromBlock({ block, tag: 'param', first: true });

         expect(result).toEqual([{ identFull: 'One', identImport: 'One', module: 'one' }]);
      });
   });
});
