/* eslint no-undef: "off" */
import fs               from 'fs-extra';

import {
   beforeAll,
   expect,
   vi }                 from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

describe('generateDTS() warnings / errors', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/generate/errors');
      fs.emptyDirSync('./test/fixture/output/generate/errors');
   });

   describe('Javascript', () =>
   {
      describe(`Bad 'imports' from 'package.json'`, () =>
      {
         it(`Bad path / missing import`, async () =>
         {
            const consoleLog = [];
            vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

            const success = await generateDTS({
               input: './test/fixture/src/generate/javascript/errors/imports/local/src/index.js',
               output: './test/fixture/output/generate/javascript/errors/imports/local/index.d.ts',
               logLevel: 'debug',
               compilerOptions: {
                  outDir: './test/fixture/output/generate/javascript/errors/imports/local/.dts'
               },
            });

            vi.restoreAllMocks();

            expect(success).toBe(false);

            expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
             '../../fixture/snapshot/generate/javascript/errors/imports/local/bad-path-missing-import.json');
         });
      });

      describe('parseFiles()', () =>
      {
         // Tests when a directory is referenced in an import, but without a corresponding `index.(m)js` file.
         // Tests when a module / file import is missing.
         it(`dir-missing-index no 'index.(m)js'`, async () =>
         {
            const consoleLog = [];
            vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

            const success = await generateDTS({
               input: './test/fixture/src/generate/javascript/errors/parseFile/dir-missing-index/index.js',
               output: './test/fixture/output/generate/javascript/errors/parseFile/dir-missing-index/index.d.ts',
               compilerOptions: { outDir: './test/fixture/output/generate/javascript/errors/parseFile/dir-missing-index/.dts' },
            });

            vi.restoreAllMocks();

            expect(success).toBe(false);

            expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
             '../../fixture/snapshot/generate/javascript/errors/parseFile/generateDTS-dir-missing-index.json');
         });
      });
   });

   describe('Typescript', () =>
   {
      describe('parseFiles()', () =>
      {
         // Tests when a directory is referenced in an import, but without a corresponding `index.(m)ts` file.
         // Tests when a module / file import is missing.
         // TS will transpile malformed imports excluding those statements that don't have a proper `index.(m)ts`.
         // Diagnostic warnings are ignored in `DTSPluginTypescript.lexerTransform`, diagnostic logs are not checked in
         // `lexerTransform`.
         it(`dir-missing-index no 'index.(m)ts'`, async () =>
         {
            const consoleLog = [];
            vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

            const success = await generateDTS({
               input: './test/fixture/src/generate/typescript/errors/parseFile/dir-missing-index/index.ts',
               output: './test/fixture/output/generate/typescript/errors/parseFile/dir-missing-index/index.d.ts',
               compilerOptions: { outDir: './test/fixture/output/generate/typescript/errors/parseFile/dir-missing-index/.dts' },
            });

            vi.restoreAllMocks();

            expect(success).toBe(true);

            expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
             '../../fixture/snapshot/generate/typescript/errors/parseFile/generateDTS-dir-missing-index.json');
         });
      });
   });
});
