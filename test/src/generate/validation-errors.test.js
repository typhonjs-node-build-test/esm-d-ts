// /* eslint no-undef: "off" */
import {
   expect,
   vi }           from 'vitest';

import {
   checkDTS,
   generateDTS }  from '../../../src/generator/index.js';

describe('Validation Errors (generate)', () =>
{
   describe('validateConfig()', () =>
   {
      it(`checkDTS() - verifies 'config' is object`, async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         const result = await checkDTS(null);

         expect(result).toBe(false);

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/generate/validation/errors/checkDTS-validateConfig-config-null-console-log.json');
      });

      it(`checkDTS() - verifies initial 'input' is a string`, async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         const result = await checkDTS({
            input: null,
         });

         expect(result).toBe(false);

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/generate/validation/errors/checkDTS-validateConfig-input-console-log.json');
      });

      it(`generateDTS() - verifies 'config' is object`, async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         const result = await generateDTS(null);

         expect(result).toBe(false);

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/generate/validation/errors/generateDTS-validateConfig-config-null-console-log.json');
      });

      it(`generateDTS() - verifies initial 'input' / 'outputExt' are strings`, async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         const result = await generateDTS({
            input: null,
            outputExt: null,
         });

         expect(result).toBe(false);

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/generate/validation/errors/generateDTS-validateConfig-input-console-log.json');
      });

      it(`verifies all remaining options`, async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         const result = await generateDTS({
            input: 'bad-path.js',
            bundlePackageExports: null,
            checkDefaultPath: null,
            conditionImports: null,
            dtsReplace: null,
            filterTags: Number.NaN,
            importsExternal: null,
            importsResolve: null,
            logLevel: null,
            output: null,
            outputGraph: null,
            outputGraphIndentation: null,
            outputPostprocess: null,
            postprocess: null,
            plugins: null,
            prependFiles: null,
            prependString: null,
            prettier: null,
            removePrivateStatic: null,
            compilerOptions: null,
            tsCheckJs: null,
            tsconfig: null,
            tsDiagnosticExternal: null,
            tsDiagnosticFilter: null,
            tsDiagnosticLog: null,
            tsFileWalk: null,
            tsTransformers: null,
            rollupExternal: null,
            rollupPaths: null,
            rollupOnwarn: null
         });

         expect(result).toBe(false);

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/generate/validation/errors/validateConfig-console-log.json');
      });
   });

   describe('validateCompilerOptions()', () =>
   {
      it(`verifies 'compilerOptions'`, async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         const result = await generateDTS({
            input: './test/fixture/src/generate/javascript/valid/index.js',
            logLevel: 'debug',
            compilerOptions: {
               module: 'BAD VALUE'
            }
         });

         expect(result).toBe(false);

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/generate/validation/errors/validateCompilerOptions-console-log.json');
      });
   });
});
