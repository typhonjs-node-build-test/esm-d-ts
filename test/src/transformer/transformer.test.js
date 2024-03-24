/* eslint no-undef: "off" */
import fs               from 'fs-extra';

import {
   beforeAll,
   expect,
   vi }                 from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

import { transformer }  from '../../../src/transformer/index.js';

describe('Transformer - generateDTS()', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/transformer');
      fs.emptyDirSync('./test/fixture/output/transformer');
   });

   describe('filterTags', () =>
   {
      it('boolean (false)', async () =>
      {
         await generateDTS({
            input: './test/fixture/src/transformer/jsdocFilterTags.js',
            output: './test/fixture/output/transformer/boolean/jsdocFilterTags.d.ts',
            compilerOptions: { outDir: './test/fixture/output/transformer/boolean/.dts' },
            filterTags: false
         });

         const result = fs.readFileSync('./test/fixture/output/transformer/boolean/jsdocFilterTags.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/transformer/jsdocFilterTags-false.d.ts');
      });

      it('array', async () =>
      {
         await generateDTS({
            input: './test/fixture/src/transformer/jsdocFilterTags.js',
            output: './test/fixture/output/transformer/array/jsdocFilterTags.d.ts',
            compilerOptions: { outDir: './test/fixture/output/transformer/array/.dts' },
            filterTags: ['hidden', 'ignore', 'internal']
         });

         const result = fs.readFileSync('./test/fixture/output/transformer/array/jsdocFilterTags.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/transformer/jsdocFilterTags.d.ts');
      });

      it('Set', async () =>
      {
         await generateDTS({
            input: './test/fixture/src/transformer/jsdocFilterTags.js',
            output: './test/fixture/output/transformer/set/jsdocFilterTags.d.ts',
            compilerOptions: { outDir: './test/fixture/output/transformer/set/.dts' },
            filterTags: new Set(['hidden', 'ignore', 'internal'])
         });

         const result = fs.readFileSync('./test/fixture/output/transformer/set/jsdocFilterTags.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/transformer/jsdocFilterTags.d.ts');
      });
   });

   describe('removePrivateStatic', () =>
   {
      it('removePrivateStatic (false)', async () =>
      {
         // Uses the (valid) Javascript test source which has a private static symbol that is not filtered.
         // When this test fails it will be an indication that a new TS version is no longer mangling private static
         // symbols.

         const success = await generateDTS({
            input: './test/fixture/src/generate/javascript/valid/index.js',
            output: './test/fixture/output/transformer/removePrivateStatic/index.d.ts',
            compilerOptions: { outDir: './test/fixture/output/transformer/removePrivateStatic/.dts' },
            removePrivateStatic: false
         });

         expect(success).toBe(true);

         const result = fs.readFileSync('./test/fixture/output/transformer/removePrivateStatic/index.d.ts',
          'utf-8');

         // Tests if there is a mangled private static symbol.
         const regexPrivateStatic = /__#\d+@#.*/;

         expect(regexPrivateStatic.test(result)).toBe(true);
      });
   });

   describe('tsTransformers', () =>
   {
      it('runs custom transformer', async () =>
      {
         const mockTransformer = vi.spyOn({ noopTransformer: transformer(() => void 0) }, 'noopTransformer');

         await generateDTS({
            input: './test/fixture/src/transformer/jsdocFilterTags.js',
            output: './test/fixture/output/transformer/tsTransformers/index.d.ts',
            compilerOptions: { outDir: './test/fixture/output/transformer/boolean/.dts' },
            tsTransformers: [mockTransformer]
         });

         expect(mockTransformer).toHaveBeenCalled();
      });
   });
});
