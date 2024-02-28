/* eslint no-undef: "off" */
import {
   beforeAll,
   expect,
   vi }                 from 'vitest';

import fs               from 'fs-extra';

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
