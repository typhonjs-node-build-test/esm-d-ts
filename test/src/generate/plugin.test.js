// /* eslint no-undef: "off" */
import fs               from 'fs-extra';

import {
   beforeAll,
   expect,
   vi }                 from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

describe('Plugin (generate)', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/plugin/valid');
      fs.emptyDirSync('./test/fixture/output/plugin/valid');
   });

   describe('generateDTS()', () =>
   {
      describe('compile:diagnostic:filter', () =>
      {
         it(`filters all diagnostic logs`, async () =>
         {
            const consoleLog = [];
            vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

            const result = await generateDTS({
               input: './test/fixture/src/generate/javascript/type-warning/index.js',
               output: './test/fixture/output/generate/plugin/valid/compile-diagnostic-filter/index.d.ts',
               compilerOptions: {
                  outDir: './test/fixture/output/generate/plugin/valid/compile-diagnostic-filter/.dts'
               },
               tsCheckJs: true,
               plugins: ['./test/fixture/src/generate/plugin/valid/CompileDiagnosticFilter.js']
            });

            expect(result).toBe(true);

            vi.restoreAllMocks();

            expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
             '../../fixture/snapshot/generate/options/diagnostic/console-log-without-diagnostic-warning.json');
         });
      });
   });
});
