/* eslint no-undef: "off" */
import {
   beforeAll,
   expect,
   vi }                       from 'vitest';

import fs                     from 'fs-extra';

import { generateDTS }        from '../../../src/generator/index.js';

import { processInheritDoc }  from '../../../src/postprocess/index.js';

describe('API Errors (postprocess)', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/postprocess/errors');
      fs.emptyDirSync('./test/fixture/output/postprocess/errors');
   });

   describe('processInheritDoc (errors)', () =>
   {
      it('bad outputPostprocess path', async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         await generateDTS({
            input: './test/fixture/src/postprocess/processInheritDoc/valid/simple/index.js',
            output: './test/fixture/output/postprocess/processInheritDoc/errors/simple/index.d.ts',
            logLevel: 'error',
            compilerOptions: { outDir: './test/fixture/output/postprocess/processInheritDoc/errors/simple/.dts' },
            postprocess: [processInheritDoc],
            outputPostprocess: './test/fixture/output/postprocess/processInheritDoc/errors/bad-path/error.d.ts'
         });

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/errors/outputPostprocess/console-log.json');
      });

      it('bad outputGraph path', async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         await generateDTS({
            input: './test/fixture/src/postprocess/processInheritDoc/valid/simple/index.js',
            output: './test/fixture/output/postprocess/processInheritDoc/errors/outputGraph/index.d.ts',
            logLevel: 'error',
            compilerOptions: { outDir: './test/fixture/output/postprocess/processInheritDoc/errors/outputGraph/.dts' },
            postprocess: [processInheritDoc],
            outputGraph: './test/fixture/output/postprocess/processInheritDoc/errors/bad-path/error.json'
         });

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/errors/outputGraph/console-log.json');
      });
   });
});
