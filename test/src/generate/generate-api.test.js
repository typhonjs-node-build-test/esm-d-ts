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
      it(`'bundlePackageExports' w/ 'checkDefaultPath'`, async () =>
      {
         await generateDTS({
            bundlePackageExports: true,
            checkDefaultPath: true,
            input: './test/fixture/src/generate/javascript/bundlePackageExports/index.js',
            output: './test/fixture/output/generate/javascript/bundlePackageExports/index.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/generate/javascript/bundlePackageExports/.dts' },
         });

         const result = fs.readFileSync('./test/fixture/output/generate/javascript/bundlePackageExports/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/bundlePackageExports/index.d.ts');
      });

      it('valid', async () =>
      {
         await generateDTS({
            input: './test/fixture/src/generate/javascript/valid/index.js',
            output: './test/fixture/output/generate/javascript/valid/index.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/generate/javascript/valid/.dts' },
         });

         const result = fs.readFileSync('./test/fixture/output/generate/javascript/valid/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/valid/index.d.ts');
      });

      it(`valid w/ 'prependFiles' / 'prependString' comments`, async () =>
      {
         await generateDTS({
            input: './test/fixture/src/generate/javascript/valid/index.js',
            output: './test/fixture/output/generate/javascript/valid-prepend/index.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/generate/javascript/valid-prepend/.dts' },
            prependFiles: ['./prependLocal.txt', './test/fixture/data/prependRoot.txt', './test/NON_EXISTENT_FILE'],
            prependString: [`/**\n * A comment from 'prependString'.\n */\n`]
         });

         const result = fs.readFileSync('./test/fixture/output/generate/javascript/valid-prepend/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/valid-prepend/index.d.ts');
      });

      it(`valid w/ 'prettier' options`, async () =>
      {
         await generateDTS({
            input: './test/fixture/src/generate/javascript/valid/index.js',
            output: './test/fixture/output/generate/javascript/valid-prettier/index.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/generate/javascript/valid-prettier/.dts' },
            prettier: { printWidth: 80, tabWidth: 4, useTabs: true }
         });

         const result = fs.readFileSync('./test/fixture/output/generate/javascript/valid-prettier/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/javascript/valid-prettier/index.d.ts');
      });
   });

   describe('Typescript', () =>
   {
      it('valid', async () =>
      {
         await generateDTS({
            input: './test/fixture/src/generate/typescript/valid/index.ts',
            output: './test/fixture/output/generate/typescript/valid/index.d.ts',
            compilerOptions: {
               jsx: 'react',
               outDir: './test/fixture/output/generate/typescript/valid/.dts'
            },
            logLevel: 'debug'
         });

         const result = fs.readFileSync('./test/fixture/output/generate/typescript/valid/index.d.ts', 'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/typescript/valid/index.d.ts');
      });
   });
});
