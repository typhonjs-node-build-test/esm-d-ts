// /* eslint no-undef: "off" */
import resolve          from "@rollup/plugin-node-resolve";
import fs               from 'fs-extra';
import { rollup }       from 'rollup';

import {
   beforeAll,
   expect,
   vi }                 from 'vitest';

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
      it('basic rollup (valid)', async () =>
      {
         const rollupConfig = {
            input: {
               input: './test/fixture/src/generate/javascript/valid/index.js',
               plugins: [
                  generateDTS.plugin({
                     compilerOptions: { outDir: './test/fixture/output/generate/rollup/basic/.dts' }
                  })
               ]
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

      it(`dir-resolve w/ resolve Rollup plugin`, async () =>
      {
         const rollupConfig = {
            input: {
               input: './test/fixture/src/generate/javascript/dir-resolve/index.js',
               plugins: [
                  resolve(), // Need to use `@rollup/plugin-node-resolve` for directory imports.
                  generateDTS.plugin({
                     compilerOptions: { outDir: './test/fixture/output/generate/rollup/dir-resolve/.dts' }
                  })
               ]
            },
            output: {
               file: './test/fixture/output/generate/rollup/dir-resolve/index.js',
               format: 'es',
            }
         };

         const bundle = await rollup(rollupConfig.input);
         await bundle.write(rollupConfig.output);
         await bundle.close();

         const result = fs.readFileSync('./test/fixture/output/generate/rollup/dir-resolve/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/dir-resolve/index.d.ts');
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

      it(`'outputExt' plugin / option`, async () =>
      {
         const rollupConfig = {
            input: {
               input: './test/fixture/src/generate/javascript/valid/index.js',
               plugins: [generateDTS.plugin({
                  compilerOptions: { outDir: './test/fixture/output/generate/rollup/basic/outputExt/.dts' },
                  outputExt: '.d.mts'
               })]
            },
            output: {
               file: './test/fixture/output/generate/rollup/basic/outputExt/index.js',
               format: 'es',
            }
         };

         const bundle = await rollup(rollupConfig.input);
         await bundle.write(rollupConfig.output);
         await bundle.close();

         const result = fs.readFileSync('./test/fixture/output/generate/rollup/basic/outputExt/index.d.mts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/valid/index.d.ts');
      });

      it(`'onwarn' (direct Rollup configuration)`, async () =>
      {
         const mock = { onwarn: () => null };
         const mocked = vi.spyOn(mock, 'onwarn');

         const rollupConfig = {
            input: {
               input: './test/fixture/src/generate/javascript/warning/index.js',
               plugins: [generateDTS.plugin({
                  compilerOptions: { outDir: './test/fixture/output/generate/rollup/basic/onwarn/.dts' },
               })],
               // Set an `onwarn` callback directly.
               onwarn: () => mock.onwarn()
            },
            output: {
               file: './test/fixture/output/generate/rollup/basic/onwarn/index.js',
               format: 'es',
            }
         };

         const bundle = await rollup(rollupConfig.input);
         await bundle.write(rollupConfig.output);
         await bundle.close();

         expect(mocked).toHaveBeenCalled();
      });
   });
});
