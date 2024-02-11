/* eslint no-undef: "off" */

import fs               from 'fs-extra';

import { generateDTS }  from '../src/generator/index.js';

describe('generateDTS (typescript)', () =>
{
   it('typescript', async () =>
   {
      fs.ensureDirSync('./test/fixture/output/typescript');
      fs.emptyDirSync('./test/fixture/output/typescript');

      await generateDTS({
         input: './test/fixture/src/typescript/index.ts',
         output: './test/fixture/output/typescript/index.d.ts',
         compilerOptions: {
            jsx: 'react'
         },
         logLevel: 'debug'
      });

      const result = fs.readFileSync('./test/fixture/output/typescript/index.d.ts', 'utf-8');

      expect(result).toMatchFileSnapshot('./fixture/snapshot/typescript/index.d.ts');
   });
});
