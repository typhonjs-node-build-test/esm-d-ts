// /* eslint no-undef: "off" */
import fs               from 'fs-extra';
import { rollup }       from 'rollup';

import {
   beforeAll,
   expect,
   vi }                 from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

describe('Rollup Plugin (generate) errors', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/generate/rollup/errors');
      fs.emptyDirSync('./test/fixture/output/generate/rollup/errors');
   });

   describe('generateDTS.plugin() errors', () =>
   {
      it(`bad 'input'`, async () =>
      {
         const consoleError = [];
         vi.spyOn(console, 'error').mockImplementation((...args) => consoleError.push(args));

         const rollupConfig = {
            input: {
               input: false, // This should be the entry point source file string.
               plugins: [generateDTS.plugin({
                  compilerOptions: { outDir: './test/fixture/output/generate/rollup/errors/.dts' }
               })]
            },
            output: {
               file: './test/fixture/output/generate/rollup/errors/index.js',
               format: 'es',
            }
         };

         let error;

         try
         {
            const bundle = await rollup(rollupConfig.input);
            await bundle.write(rollupConfig.output);
            await bundle.close();
         }
         catch (err)
         {
            error = err;
         }

         vi.restoreAllMocks();

         expect(error).toBeDefined();

         expect(JSON.stringify(consoleError, null, 2)).toMatchFileSnapshot(
          `../../fixture/snapshot/generate/rollup/errors/bad-input_console.error.json`);
      });

      it(`bad 'output.file'`, async () =>
      {
         const rollupConfig = {
            input: {
               input: './test/fixture/src/generate/javascript/valid/index.js',
               plugins: [generateDTS.plugin({
                  compilerOptions: { outDir: './test/fixture/output/generate/rollup/errors/.dts' }
               })]
            },
            output: {
               file: false,  // This should be the output bundle file string.
               format: 'es',
            }
         };

         let error;

         try
         {
            const bundle = await rollup(rollupConfig.input);
            await bundle.write(rollupConfig.output);
            await bundle.close();
         }
         catch (err)
         {
            error = err;
         }

         expect(error).toBeDefined();

         // Rollup will throw an error before the sanity checking code in `generateDTS.plugin()` is triggered.
      });
   });
});
