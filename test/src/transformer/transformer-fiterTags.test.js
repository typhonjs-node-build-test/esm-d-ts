/* eslint no-undef: "off" */
import fs               from 'fs-extra';

import {
   beforeAll,
   expect }             from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

describe('Transformer - generateDTS()', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/transformer');
      fs.emptyDirSync('./test/fixture/output/transformer');
   });

   describe('filterTags', () =>
   {
      it('array', async () =>
      {
         await generateDTS({
            input: './test/fixture/src/transformer/jsdocFilterTags.js',
            output: './test/fixture/output/transformer/array/jsdocFilterTags.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/transformer/array/.dts' },
            filterTags: ['hidden', 'ignore']
         });

         const result = fs.readFileSync('./test/fixture/output/transformer/array/jsdocFilterTags.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/transformer/jsdocFilterTags.d.ts');
      });

      it('Set', async () =>
      {
         await generateDTS({
            input: './test/fixture/src/transformer/jsdocFilterTags.js',
            output: './test/fixture/output/transformer/set/jsdocFilterTags.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/transformer/set/.dts' },
            filterTags: new Set(['hidden', 'ignore'])
         });

         const result = fs.readFileSync('./test/fixture/output/transformer/set/jsdocFilterTags.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/transformer/jsdocFilterTags.d.ts');
      });
   });
});
