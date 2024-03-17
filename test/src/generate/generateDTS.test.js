/* eslint no-undef: "off" */
import fs               from 'fs-extra';

import {
   beforeAll,
   expect }             from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

describe('generateDTS()', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/generate/javascript');
      fs.emptyDirSync('./test/fixture/output/generate/javascript');
      fs.ensureDirSync('./test/fixture/output/generate/typescript');
      fs.emptyDirSync('./test/fixture/output/generate/typescript');
   });

   describe('Javascript', () =>
   {
      it('dir-resolve', async () =>
      {
         // Note this test attempts to re-export `./dir2` which is backed by an `index.mjs` file instead of `index.js`.
         // Typescript / TSC ~5.3.3 doesn't correctly emit in the `index.d.ts` file a re-export of `./dir2`.

         const success = await generateDTS({
            input: './test/fixture/src/generate/javascript/dir-resolve/index.js',
            output: './test/fixture/output/generate/javascript/dir-resolve/index.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/generate/javascript/dir-resolve/.dts' },
         });

         expect(success).toBe(true);

         const result = fs.readFileSync('./test/fixture/output/generate/javascript/dir-resolve/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/dir-resolve/index.d.ts');
      });

      it(`local file 'imports' path`, async () =>
      {
         const success = await generateDTS({
            input: './test/fixture/src/generate/javascript/imports/local/src/index.js',
            output: './test/fixture/output/generate/javascript/imports/local/index.d.ts',
            logLevel: 'debug',
            compilerOptions: {
               outDir: './test/fixture/output/generate/javascript/imports/local/.dts'
            },
         });

         expect(success).toBe(true);

         const result = fs.readFileSync(
          './test/fixture/output/generate/javascript/imports/local/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot(
          '../../fixture/snapshot/generate/javascript/imports/local/index.d.ts');
      });

      it('valid', async () =>
      {
         const success = await generateDTS({
            input: './test/fixture/src/generate/javascript/valid/index.js',
            output: './test/fixture/output/generate/javascript/valid/index.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/generate/javascript/valid/.dts' },
         });

         expect(success).toBe(true);

         const result = fs.readFileSync('./test/fixture/output/generate/javascript/valid/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/valid/index.d.ts');
      });

      it('valid w/ tsconfig', async () =>
      {
         const success = await generateDTS({
            input: './test/fixture/src/generate/javascript/valid/index.js',
            output: './test/fixture/output/generate/javascript/valid-tsconfig/index.d.ts',
            tsconfig: './test/fixture/data/tsconfig-valid.json'
         });

         expect(success).toBe(true);

         const result = fs.readFileSync('./test/fixture/output/generate/javascript/valid-tsconfig/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/valid/index.d.ts');
      });

      it('valid w/ iterable config (error)', async () =>
      {
         const config = [
            {
               input: './test/fixture/src/generate/javascript/valid/index.js',
               output: './test/fixture/output/generate/javascript/valid-iterable/index.d.ts',
               compilerOptions: { outDir: './test/fixture/output/generate/javascript/valid-iterable/.dts' },
            },
            null // This will produce an error in `processConfig`.
         ];

         const success = await generateDTS(config);

         // `null` config above will cause false to return indicating not all configs ran.
         expect(success).toBe(false);

         const result = fs.readFileSync('./test/fixture/output/generate/javascript/valid-iterable/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/valid/index.d.ts');
      });

      it(`valid w/ 'prependFiles' / 'prependString' comments`, async () =>
      {
         const success = await generateDTS({
            input: './test/fixture/src/generate/javascript/valid/index.js',
            output: './test/fixture/output/generate/javascript/valid-prepend/index.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/generate/javascript/valid-prepend/.dts' },
            prependFiles: ['./prependLocal.txt', './test/fixture/data/prependRoot.txt', './test/NON_EXISTENT_FILE'],
            prependString: [`/**\n * A comment from 'prependString'.\n */\n`]
         });

         expect(success).toBe(true);

         const result = fs.readFileSync('./test/fixture/output/generate/javascript/valid-prepend/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/valid-prepend/index.d.ts');
      });

      it(`valid w/ 'prettier' options`, async () =>
      {
         const success = await generateDTS({
            input: './test/fixture/src/generate/javascript/valid/index.js',
            output: './test/fixture/output/generate/javascript/valid-prettier/index.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/generate/javascript/valid-prettier/.dts' },
            prettier: { printWidth: 80, tabWidth: 4, useTabs: true }
         });

         expect(success).toBe(true);

         const result = fs.readFileSync('./test/fixture/output/generate/javascript/valid-prettier/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/valid-prettier/index.d.ts');
      });
   });

   describe('Typescript', () =>
   {
      it('basic (valid)', async () =>
      {
         const success = await generateDTS({
            input: './test/fixture/src/generate/typescript/valid/index.ts',
            output: './test/fixture/output/generate/typescript/valid/index.d.ts',
            compilerOptions: {
               jsx: 'react',
               outDir: './test/fixture/output/generate/typescript/valid/.dts'
            },
            logLevel: 'debug'
         });

         expect(success).toBe(true);

         const result = fs.readFileSync('./test/fixture/output/generate/typescript/valid/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/typescript/valid/index.d.ts');
      });

      it('dir-resolve', async () =>
      {
         // Note this test attempts to re-export `./dir2` which is backed by an `index.mts` file instead of `index.ts`.
         // Typescript / TSC ~5.3.3 does emit in the `index.d.ts` file a re-export of `./dir2`, but can't handle the
         // the backing `index.d.mts` file.

         const success = await generateDTS({
            input: './test/fixture/src/generate/typescript/dir-resolve/index.ts',
            output: './test/fixture/output/generate/typescript/dir-resolve/index.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/generate/typescript/dir-resolve/.dts' },
         });

         expect(success).toBe(false);

         let result;

         try
         {
            result = fs.readFileSync('./test/fixture/output/generate/typescript/dir-resolve/index.d.ts', 'utf-8');
         }
         catch (err) { /**/ }

         expect(result).toBeUndefined();
      });
   });
});
