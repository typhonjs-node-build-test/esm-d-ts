// /* eslint no-undef: "off" */
import fs               from 'fs-extra';
import { rollup }       from 'rollup';
import {
   beforeAll,
   expect }             from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

describe('Rollup Plugin (generate)', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/generate/rollup/basic');
      fs.emptyDirSync('./test/fixture/output/generate/rollup/basic');
   });

   describe('generateDTS.plugin()', () =>
   {
      it('basic rollup', async () =>
      {
         const rollupConfig = {
            input: {
               input: './test/fixture/src/generate/javascript/valid/index.js',
               plugins: [generateDTS.plugin({
                  compilerOptions: { outDir: './test/fixture/output/generate/rollup/basic/.dts' }
               })]
            },
            output: {
               file: './test/fixture/output/generate/rollup/basic/index.js',
               format: 'es',
            }
         };

         const bundle = await rollup(rollupConfig.input);
         await bundle.write(rollupConfig.output);
         await bundle.close();

         const result = fs.readFileSync('./test/fixture/output/generate/rollup/basic/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/valid/index.d.ts');
      });

      it(`'dtsReplace' plugin / option`, async () =>
      {
         const rollupConfig = {
            input: {
               input: './test/fixture/src/generate/javascript/valid/index.js',
               plugins: [generateDTS.plugin({
                  compilerOptions: { outDir: './test/fixture/output/generate/rollup/basic/dtsReplace/.dts' },
                  dtsReplace: {
                     ITest: 'IReplacedTest'
                  }
               })]
            },
            output: {
               file: './test/fixture/output/generate/rollup/basic/dtsReplace/index.js',
               format: 'es',
            }
         };

         const bundle = await rollup(rollupConfig.input);
         await bundle.write(rollupConfig.output);
         await bundle.close();

         const result = fs.readFileSync('./test/fixture/output/generate/rollup/basic/dtsReplace/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/rollup/basic/dtsReplace/index.d.ts');
      });
   });
});
