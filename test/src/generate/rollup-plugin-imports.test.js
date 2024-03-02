// /* eslint no-undef: "off" */
import resolve          from '@rollup/plugin-node-resolve';
import {
   importsExternal,
   importsResolve }     from '@typhonjs-build-test/rollup-plugin-pkg-imports';
import fs               from 'fs-extra';
import { rollup }       from 'rollup';
import {
   beforeAll,
   expect }             from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

describe.skip('Rollup Plugin Imports (generate)', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/generate/rollup/imports');
      fs.emptyDirSync('./test/fixture/output/generate/rollup/imports');
   });

   describe('generateDTS.plugin()', () =>
   {
      describe('external plugin', () =>
      {
         describe('no options', () =>
         {
            it(`'importsExternal'`, async () =>
            {
               const rollupConfig = {
                  input: {
                     input: './test/fixture/src/generate/rollup/imports/index.js',
                     plugins: [
                        importsExternal(),
                        resolve(),
                        generateDTS.plugin({
                           bundlePackageExports: true,
                           compilerOptions: { outDir: './test/fixture/output/generate/rollup/imports/external/plugin/.dts' },
                     })]
                  },
                  output: {
                     file: './test/fixture/output/generate/rollup/imports/external/plugin/index.js',
                     format: 'es',
                  }
               };

               const bundle = await rollup(rollupConfig.input);
               await bundle.write(rollupConfig.output);
               await bundle.close();

               const result = fs.readFileSync('./test/fixture/output/generate/rollup/imports/external/plugin/index.d.ts', 'utf-8');

               // expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/rollup/imports/external/plugin/index.d.ts');
            });

            it(`'importsResolve'`, async () =>
            {
               const rollupConfig = {
                  input: {
                     input: './test/fixture/src/generate/rollup/imports/index.js',
                     plugins: [
                        importsResolve(),
                        resolve(),
                        generateDTS.plugin({
                           bundlePackageExports: true,
                           compilerOptions: { outDir: './test/fixture/output/generate/rollup/imports/resolve/plugin/.dts' },
                     })]
                  },
                  output: {
                     file: './test/fixture/output/generate/rollup/imports/resolve/plugin/index.js',
                     format: 'es',
                  }
               };

               const bundle = await rollup(rollupConfig.input);
               await bundle.write(rollupConfig.output);
               await bundle.close();

               const result = fs.readFileSync('./test/fixture/output/generate/rollup/imports/resolve/plugin/index.d.ts', 'utf-8');

               // expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/rollup/imports/resolve/index-plugin.d.ts');
            });
         });

         // describe('with options', () =>
         // {
         //
         // });
      });
   });
});
