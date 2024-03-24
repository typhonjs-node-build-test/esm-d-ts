/* eslint no-undef: "off" */
import fs               from 'fs-extra';

import {
   beforeAll,
   expect,
   vi }                 from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

describe('generateDTS()', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/generate/options');
      fs.emptyDirSync('./test/fixture/output/generate/options');
   });

   describe('options (non-default)', () =>
   {
      it('tsDiagnosticExternal (true)', async () =>
      {
         // Just tests coverage of enabling the default diagnostic filter for external packages.

         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         const success = await generateDTS({
            input: './test/fixture/src/generate/javascript/type-warning/index.js',
            output: './test/fixture/output/generate/options/tsDiagnosticExternal/index.d.ts',
            compilerOptions: {
               outDir: './test/fixture/output/generate/options/tsDiagnosticExternal/.dts'
            },
            tsCheckJs: true,
            tsDiagnosticExternal: true
         });

         vi.restoreAllMocks();

         expect(success).toBe(true);

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/generate/options/diagnostic/console-log-with-diagnostic-warning.json');
      });

      it('tsDiagnosticFilter (() => false))', async () =>
      {
         // Provides custom diagnostic filter which rejects all diagnostic logging.

         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         const success = await generateDTS({
            input: './test/fixture/src/generate/javascript/type-warning/index.js',
            output: './test/fixture/output/generate/options/tsDiagnosticFilter/index.d.ts',
            compilerOptions: {
               outDir: './test/fixture/output/generate/options/tsDiagnosticFilter/.dts'
            },
            tsCheckJs: true,
            tsDiagnosticFilter: () => true
         });

         vi.restoreAllMocks();

         expect(success).toBe(true);

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/generate/options/diagnostic/console-log-without-diagnostic-warning.json');
      });

      it('tsDiagnosticLog (false)', async () =>
      {
         // Enabling `checkJs`, but disable diagnostic logging.

         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         const success = await generateDTS({
            input: './test/fixture/src/generate/javascript/type-warning/index.js',
            output: './test/fixture/output/generate/options/tsDiagnosticLog-false/index.d.ts',
            compilerOptions: {
               outDir: './test/fixture/output/generate/options/tsDiagnosticLog-false/.dts'
            },
            tsCheckJs: true,
            tsDiagnosticLog: false
         });

         vi.restoreAllMocks();

         expect(success).toBe(true);

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/generate/options/diagnostic/console-log-without-diagnostic-warning.json');
      });
   });
});
