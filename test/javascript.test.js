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
      fs.ensureDirSync('./test/fixture/output/javascript');
      fs.emptyDirSync('./test/fixture/output/javascript');
   });

   it('valid', async () =>
   {
      await generateDTS({
         input: './test/fixture/src/javascript/valid/index.js',
         output: './test/fixture/output/javascript/valid/index.d.ts',
         logLevel: 'debug',
         compilerOptions: { outDir: './test/fixture/output/javascript/valid/.dts' },
      });

      const result = fs.readFileSync('./test/fixture/output/javascript/valid/index.d.ts', 'utf-8');

      expect(result).toMatchFileSnapshot('./fixture/snapshot/javascript/valid/index.d.ts');
   });
});
