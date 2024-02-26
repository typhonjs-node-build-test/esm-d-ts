/* eslint no-undef: "off" */
import {
   beforeAll,
   expect,
   vi }                       from 'vitest';

import fs                     from 'fs-extra';

import { generateDTS }        from '../../../src/generator/index.js';

import {
   PostProcess,
   processInheritDoc }        from '../../../src/postprocess/index.js';

import { logger }             from '#util';

describe('API Warnings (postprocess)', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/postprocess/warnings');
      fs.emptyDirSync('./test/fixture/output/postprocess/warnings');
   });

   describe('PostProcess', () =>
   {
      describe('logged warning', () =>
      {
         it('process - processors[0] is not a function', () =>
         {
            const consoleLog = [];
            vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

            logger.setLogLevel('warn');

            PostProcess.process({
               filepath: './test/fixture/src/postprocess/Postprocess/warnings/no-op.d.ts',
               processors: [false],
               dependencies: false,
               logStart: false
            });

            vi.restoreAllMocks();

            expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
             '../../fixture/snapshot/postprocess/Postprocess/warnings/processors/console-log.json');
         });
      });
   });

   describe('processInheritDoc (warnings)', () =>
   {
      it('generateDTS() -> processInheritDoc', async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         await generateDTS({
            input: './test/fixture/src/postprocess/processInheritDoc/warnings/index.js',
            output: './test/fixture/output/postprocess/processInheritDoc/warnings/index.d.ts',
            logLevel: 'warn',
            compilerOptions: { outDir: './test/fixture/output/postprocess/processInheritDoc/warnings/.dts' },
            postprocess: [processInheritDoc]
         });

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/warnings/console-log.json');
      });
   });
});
