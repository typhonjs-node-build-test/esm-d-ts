/* eslint no-undef: "off" */
import fs               from 'fs-extra';

import ts               from 'typescript';

import {
   beforeAll,
   expect,
   vi }                 from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';


describe('generateDTS() package options', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/generate/packages');
      fs.emptyDirSync('./test/fixture/output/generate/packages');
   });

   describe('Javascript - GenerateConfig options', () =>
   {
      describe('top level package exports', () =>
      {
         describe('with bundlePackageExports', () =>
         {
            it(`(direct) w/ 'checkDefaultPath'`, async () =>
            {
               const success = await generateDTS({
                  bundlePackageExports: true,
                  checkDefaultPath: true,
                  input: './test/fixture/src/generate/packages/direct/index.js',
                  output: './test/fixture/output/generate/packages/bundlePackageExports/direct/index.d.ts',
                  logLevel: 'debug',
                  compilerOptions: {
                     outDir: './test/fixture/output/generate/packages/bundlePackageExports/direct/.dts'
                  },
               });

               expect(success).toBe(true);

               const result = fs.readFileSync(
                './test/fixture/output/generate/packages/bundlePackageExports/direct/index.d.ts', 'utf-8');

               expect(result).toMatchFileSnapshot(
                '../../fixture/snapshot/generate/packages/bundlePackageExports/direct/index.d.ts');
            });

            it(`(direct / installed)`, async () =>
            {
               const success = await generateDTS({
                  bundlePackageExports: true,
                  input: './test/fixture/src/generate/packages/direct/installed/index.js',
                  output:
                   './test/fixture/output/generate/packages/bundlePackageExports/direct/installed/index.d.ts',
                  logLevel: 'debug',
                  compilerOptions: {
                     outDir: './test/fixture/output/generate/packages/bundlePackageExports/direct/installed/.dts'
                  },
               });

               expect(success).toBe(true);

               const result = fs.readFileSync(
                './test/fixture/output/generate/packages/bundlePackageExports/direct/installed/index.d.ts',
                 'utf-8');

               expect(result).toMatchFileSnapshot(
                '../../fixture/snapshot/generate/packages/bundlePackageExports/direct/installed/index.d.ts');
            });

            describe('importsExternal', () =>
            {
               it(`(direct / imports) w/ 'checkDefaultPath'`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/packages/imports/external/index.js',
                     output:
                      './test/fixture/output/generate/packages/bundlePackageExports/imports/external/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/bundlePackageExports/imports/external/.dts'
                     },
                     importsExternal: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/bundlePackageExports/imports/external/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/external/index.d.ts');
               });

               it(`(direct / imports partial) w/ 'importKeys option'`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/packages/imports/external/index.js',
                     output: './test/fixture/output/generate/packages/bundlePackageExports/imports/external/partial/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/bundlePackageExports/imports/external/partial/.dts'
                     },
                     importsExternal: { importKeys: ['#importsForTesting/*'] }
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/bundlePackageExports/imports/external/partial/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/external/partial/index.d.ts');
               });

               it(`(imports / installed)`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     input: './test/fixture/src/generate/packages/imports/external/installed/index.js',
                     output: './test/fixture/output/generate/packages/bundlePackageExports/imports/external/installed/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/bundlePackageExports/imports/external/installed/.dts'
                     },
                     importsExternal: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/bundlePackageExports/imports/external/installed/index.d.ts', 'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/external/installed/index.d.ts');
               });
            });

            describe('importsResolve', () =>
            {
               describe('warnings', () =>
               {
                  it(`(direct / no types)`, async () =>
                  {
                     const consoleLog = [];
                     vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

                     const success = await generateDTS({
                        bundlePackageExports: true,
                        input: './test/fixture/src/generate/packages/imports/resolve-warning/no-types/index.js',
                        output:
                         './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve-warning/no-types/index.d.ts',
                        compilerOptions: {
                           outDir: './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve-warning/no-types/.dts'
                        },
                        importsResolve: true
                     });

                     vi.restoreAllMocks();

                     expect(success).toBe(true);

                     const result = fs.readFileSync(
                      './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve-warning/no-types/index.d.ts',
                       'utf-8');

                     const tsVersion = parseFloat(ts.versionMajorMinor);

                     // Takes into account changes in TS declaration generation pre / post TS `5.4`. Post `5.4` the
                     // package that has no types is present in the declarations.
                     const snapshot = tsVersion >= 5.4 ?
                      '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/resolve-warning/no-types/index-post-5_4.d.ts' :
                       '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/resolve-warning/no-types/index-pre-5_4.d.ts';

                     expect(result).toMatchFileSnapshot(snapshot);

                     expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
                      '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/resolve-warning/no-types/console-log.json');
                  });

                  it(`(importKeys not package)`, async () =>
                  {
                     const consoleLog = [];
                     vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

                     const success = await generateDTS({
                        bundlePackageExports: true,
                        input: './test/fixture/src/generate/packages/imports/resolve-warning/not-package/index.js',
                        output:
                         './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve-warning/not-package/index.d.ts',
                        compilerOptions: {
                           outDir: './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve-warning/not-package/.dts'
                        },
                        importsResolve: { importKeys: ['#importsNotPackage', '#importsForTesting/*'] }
                     });

                     vi.restoreAllMocks();

                     expect(success).toBe(true);

                     const result = fs.readFileSync(
                      './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve-warning/not-package/index.d.ts',
                       'utf-8');

                     expect(result).toMatchFileSnapshot(
                      '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/resolve-warning/not-package/index.d.ts');

                     expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
                      '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/resolve-warning/not-package/console-log.json');
                  });

                  it(`(imports / bad importKeys)`, async () =>
                  {
                     const consoleLog = [];
                     vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

                     const success = await generateDTS({
                        bundlePackageExports: true,
                        input: './test/fixture/src/generate/packages/imports/resolve/index.js',
                        output:
                         './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve-warning/bad-importKey/index.d.ts',
                        compilerOptions: {
                           outDir: './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve-warning/bad-importKey/.dts'
                        },
                        importsResolve: { importKeys: ['BAD_KEY', '#importsForTesting/*', '#importsForTesting2'] }
                     });

                     vi.restoreAllMocks();

                     expect(success).toBe(true);

                     const result = fs.readFileSync(
                      './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve-warning/bad-importKey/index.d.ts',
                       'utf-8');

                     expect(result).toMatchFileSnapshot(
                      '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/resolve-warning/bad-importKey/index.d.ts');

                     expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
                      '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/resolve-warning/bad-importKey/console-log.json');
                  });
               });

               it(`(direct / imports) w/ 'checkDefaultPath'`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/packages/imports/resolve/index.js',
                     output:
                      './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve/.dts'
                     },
                     importsResolve: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/resolve/index.d.ts');
               });

               it(`(direct / imports partial) w/ 'importKeys option'`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/packages/imports/resolve/index.js',
                     output: './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve/partial/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve/partial/.dts'
                     },
                     importsResolve: { importKeys: ['#importsForTesting/*'] }
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve/partial/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/resolve/partial/index.d.ts');
               });

               it(`(imports / installed)`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     input: './test/fixture/src/generate/packages/imports/resolve/installed/index.js',
                     output: './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve/installed/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve/installed/.dts'
                     },
                     importsResolve: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/bundlePackageExports/imports/resolve/installed/index.d.ts', 'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/bundlePackageExports/imports/resolve/installed/index.d.ts');
               });
            });
         });

         describe('without bundlePackageExports', () =>
         {
            it(`(direct) w/ 'checkDefaultPath'`, async () =>
            {
               const success = await generateDTS({
                  checkDefaultPath: true,
                  input: './test/fixture/src/generate/packages/direct/index.js',
                  output: './test/fixture/output/generate/packages/no-bundlePackageExports/direct/index.d.ts',
                  logLevel: 'debug',
                  compilerOptions: {
                     outDir: './test/fixture/output/generate/packages/no-bundlePackageExports/direct/.dts'
                  },
               });

               expect(success).toBe(true);

               const result = fs.readFileSync(
                './test/fixture/output/generate/packages/no-bundlePackageExports/direct/index.d.ts', 'utf-8');

               expect(result).toMatchFileSnapshot(
                '../../fixture/snapshot/generate/packages/no-bundlePackageExports/direct/index.d.ts');
            });

            it(`(direct / installed)`, async () =>
            {
               const success = await generateDTS({
                  input: './test/fixture/src/generate/packages/direct/installed/index.js',
                  output:
                   './test/fixture/output/generate/packages/no-bundlePackageExports/direct/installed/index.d.ts',
                  logLevel: 'debug',
                  compilerOptions: {
                     outDir: './test/fixture/output/generate/packages/no-bundlePackageExports/direct/installed/.dts'
                  },
               });

               expect(success).toBe(true);

               const result = fs.readFileSync(
                './test/fixture/output/generate/packages/no-bundlePackageExports/direct/installed/index.d.ts',
                 'utf-8');

               expect(result).toMatchFileSnapshot(
                '../../fixture/snapshot/generate/packages/no-bundlePackageExports/direct/installed/index.d.ts');
            });

            describe('importsExternal', () =>
            {
               it(`(direct / imports) w/ 'checkDefaultPath'`, async () =>
               {
                  const success = await generateDTS({
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/packages/imports/external/index.js',
                     output:
                      './test/fixture/output/generate/packages/no-bundlePackageExports/imports/external/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/no-bundlePackageExports/imports/external/.dts'
                     },
                     importsExternal: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/no-bundlePackageExports/imports/external/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/no-bundlePackageExports/imports/external/index.d.ts');
               });

               it(`(direct / imports) w/ 'importKeys option'`, async () =>
               {
                  const success = await generateDTS({
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/packages/imports/external/index.js',
                     output: './test/fixture/output/generate/packages/no-bundlePackageExports/imports/external/partial/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/no-bundlePackageExports/imports/external/partial/.dts'
                     },
                     importsExternal: { importKeys: ['#importsForTesting/*'] }
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/no-bundlePackageExports/imports/external/partial/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/no-bundlePackageExports/imports/external/partial/index.d.ts');
               });

               it(`(imports / installed)`, async () =>
               {
                  const success = await generateDTS({
                     input: './test/fixture/src/generate/packages/imports/external/installed/index.js',
                     output: './test/fixture/output/generate/packages/no-bundlePackageExports/imports/external/installed/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/no-bundlePackageExports/imports/external/installed/.dts'
                     },
                     importsExternal: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/no-bundlePackageExports/imports/external/installed/index.d.ts', 'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/no-bundlePackageExports/imports/external/installed/index.d.ts');
               });
            });

            describe('importsResolve', () =>
            {
               it(`(direct / imports) w/ 'checkDefaultPath'`, async () =>
               {
                  const success = await generateDTS({
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/packages/imports/resolve/index.js',
                     output:
                      './test/fixture/output/generate/packages/no-bundlePackageExports/imports/resolve/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/no-bundlePackageExports/imports/resolve/.dts'
                     },
                     importsResolve: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/no-bundlePackageExports/imports/resolve/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/no-bundlePackageExports/imports/resolve/index.d.ts');
               });

               it(`(direct / imports) w/ 'importKeys option'`, async () =>
               {
                  const success = await generateDTS({
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/packages/imports/resolve/index.js',
                     output: './test/fixture/output/generate/packages/no-bundlePackageExports/imports/resolve/partial/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/no-bundlePackageExports/imports/resolve/partial/.dts'
                     },
                     importsResolve: { importKeys: ['#importsForTesting/*'] }
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/no-bundlePackageExports/imports/resolve/partial/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/no-bundlePackageExports/imports/resolve/partial/index.d.ts');
               });

               it(`(imports / installed)`, async () =>
               {
                  const success = await generateDTS({
                     input: './test/fixture/src/generate/packages/imports/resolve/installed/index.js',
                     output: './test/fixture/output/generate/packages/no-bundlePackageExports/imports/resolve/installed/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/packages/no-bundlePackageExports/imports/resolve/installed/.dts'
                     },
                     importsResolve: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/packages/no-bundlePackageExports/imports/resolve/installed/index.d.ts', 'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/packages/no-bundlePackageExports/imports/resolve/installed/index.d.ts');
               });
            });
         });
      });
   });
});
