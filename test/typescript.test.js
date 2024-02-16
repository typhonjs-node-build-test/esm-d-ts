/* eslint no-undef: "off" */
import {
   beforeAll,
   expect,
   vi }                 from 'vitest';

import fs               from 'fs-extra';

import { generateDTS }  from '../src/generator/index.js';

describe('Typescript', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/typescript');
      fs.emptyDirSync('./test/fixture/output/typescript');
   });

   it('valid', async () =>
   {
      await generateDTS({
         input: './test/fixture/src/typescript/valid/index.ts',
         output: './test/fixture/output/typescript/valid/index.d.ts',
         compilerOptions: {
            jsx: 'react',
            outDir: './test/fixture/output/typescript/valid/.dts'
         },
         logLevel: 'debug'
      });

      const result = fs.readFileSync('./test/fixture/output/typescript/valid/index.d.ts', 'utf-8');

      expect(result).toMatchFileSnapshot('./fixture/snapshot/typescript/valid/index.d.ts');
   });
});
