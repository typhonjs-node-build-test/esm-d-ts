/* eslint no-undef: "off" */
import fs               from 'fs-extra';

import {
   beforeAll,
   expect }             from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

describe('generateDTS()', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/generate/javascript');
      fs.emptyDirSync('./test/fixture/output/generate/javascript');
      fs.ensureDirSync('./test/fixture/output/generate/typescript');
      fs.emptyDirSync('./test/fixture/output/generate/typescript');
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
                  input: './test/fixture/src/generate/javascript/packages/direct/index.js',
                  output: './test/fixture/output/generate/javascript/packages/bundlePackageExports/direct/index.d.ts',
                  logLevel: 'debug',
                  compilerOptions: {
                     outDir: './test/fixture/output/generate/javascript/packages/bundlePackageExports/direct/.dts'
                  },
               });

               expect(success).toBe(true);

               const result = fs.readFileSync(
                './test/fixture/output/generate/javascript/packages/bundlePackageExports/direct/index.d.ts', 'utf-8');

               expect(result).toMatchFileSnapshot(
                '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/direct/index.d.ts');
            });

            it(`(direct / installed)`, async () =>
            {
               const success = await generateDTS({
                  bundlePackageExports: true,
                  input: './test/fixture/src/generate/javascript/packages/direct/installed/index.js',
                  output:
                   './test/fixture/output/generate/javascript/packages/bundlePackageExports/direct/installed/index.d.ts',
                  logLevel: 'debug',
                  compilerOptions: {
                     outDir: './test/fixture/output/generate/javascript/packages/bundlePackageExports/direct/installed/.dts'
                  },
               });

               expect(success).toBe(true);

               const result = fs.readFileSync(
                './test/fixture/output/generate/javascript/packages/bundlePackageExports/direct/installed/index.d.ts',
                 'utf-8');

               expect(result).toMatchFileSnapshot(
                '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/direct/installed/index.d.ts');
            });

            describe('importsExternal', () =>
            {
               it(`(direct / imports) w/ 'checkDefaultPath'`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/javascript/packages/imports/external/index.js',
                     output:
                      './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/external/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/external/.dts'
                     },
                     importsExternal: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/external/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/external/index.d.ts');
               });

               it(`(direct / imports partial) w/ 'importKeys option'`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/javascript/packages/imports/external/index.js',
                     output: './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/external/partial/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/external/partial/.dts'
                     },
                     importsExternal: { importKeys: ['#importsForTesting/*'] }
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/external/partial/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/external/partial/index.d.ts');
               });

               it(`(imports / installed)`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     input: './test/fixture/src/generate/javascript/packages/imports/external/installed/index.js',
                     output: './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/external/installed/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/external/installed/.dts'
                     },
                     importsExternal: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/external/installed/index.d.ts', 'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/external/installed/index.d.ts');
               });
            });

            describe('importsResolve', () =>
            {
               it(`(direct / imports) w/ 'checkDefaultPath'`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/javascript/packages/imports/resolve/index.js',
                     output:
                      './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/resolve/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/resolve/.dts'
                     },
                     importsResolve: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/resolve/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/resolve/index.d.ts');
               });

               it(`(direct / imports partial) w/ 'importKeys option'`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/javascript/packages/imports/resolve/index.js',
                     output: './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/resolve/partial/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/resolve/partial/.dts'
                     },
                     importsResolve: { importKeys: ['#importsForTesting/*'] }
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/resolve/partial/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/resolve/partial/index.d.ts');
               });

               it(`(imports / installed)`, async () =>
               {
                  const success = await generateDTS({
                     bundlePackageExports: true,
                     input: './test/fixture/src/generate/javascript/packages/imports/resolve/installed/index.js',
                     output: './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/resolve/installed/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/resolve/installed/.dts'
                     },
                     importsResolve: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/bundlePackageExports/imports/resolve/installed/index.d.ts', 'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/resolve/installed/index.d.ts');
               });
            });
         });

         describe('without bundlePackageExports', () =>
         {
            it(`(direct) w/ 'checkDefaultPath'`, async () =>
            {
               const success = await generateDTS({
                  checkDefaultPath: true,
                  input: './test/fixture/src/generate/javascript/packages/direct/index.js',
                  output: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/direct/index.d.ts',
                  logLevel: 'debug',
                  compilerOptions: {
                     outDir: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/direct/.dts'
                  },
               });

               expect(success).toBe(true);

               const result = fs.readFileSync(
                './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/direct/index.d.ts', 'utf-8');

               expect(result).toMatchFileSnapshot(
                '../../fixture/snapshot/generate/javascript/packages/no-bundlePackageExports/direct/index.d.ts');
            });

            it(`(direct / installed)`, async () =>
            {
               const success = await generateDTS({
                  input: './test/fixture/src/generate/javascript/packages/direct/installed/index.js',
                  output:
                   './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/direct/installed/index.d.ts',
                  logLevel: 'debug',
                  compilerOptions: {
                     outDir: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/direct/installed/.dts'
                  },
               });

               expect(success).toBe(true);

               const result = fs.readFileSync(
                './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/direct/installed/index.d.ts',
                 'utf-8');

               expect(result).toMatchFileSnapshot(
                '../../fixture/snapshot/generate/javascript/packages/no-bundlePackageExports/direct/installed/index.d.ts');
            });

            describe('importsExternal', () =>
            {
               it(`(direct / imports) w/ 'checkDefaultPath'`, async () =>
               {
                  const success = await generateDTS({
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/javascript/packages/imports/external/index.js',
                     output:
                      './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/external/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/external/.dts'
                     },
                     importsExternal: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/external/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/no-bundlePackageExports/imports/external/index.d.ts');
               });

               it(`(direct / imports) w/ 'importKeys option'`, async () =>
               {
                  const success = await generateDTS({
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/javascript/packages/imports/external/index.js',
                     output: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/external/partial/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/external/partial/.dts'
                     },
                     importsExternal: { importKeys: ['#importsForTesting/*'] }
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/external/partial/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/no-bundlePackageExports/imports/external/partial/index.d.ts');
               });

               it(`(imports / installed)`, async () =>
               {
                  const success = await generateDTS({
                     input: './test/fixture/src/generate/javascript/packages/imports/external/installed/index.js',
                     output: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/external/installed/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/external/installed/.dts'
                     },
                     importsExternal: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/external/installed/index.d.ts', 'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/no-bundlePackageExports/imports/external/installed/index.d.ts');
               });
            });

            describe('importsResolve', () =>
            {
               it(`(direct / imports) w/ 'checkDefaultPath'`, async () =>
               {
                  const success = await generateDTS({
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/javascript/packages/imports/resolve/index.js',
                     output:
                      './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/resolve/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/resolve/.dts'
                     },
                     importsResolve: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/resolve/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/no-bundlePackageExports/imports/resolve/index.d.ts');
               });

               it(`(direct / imports) w/ 'importKeys option'`, async () =>
               {
                  const success = await generateDTS({
                     checkDefaultPath: true,
                     input: './test/fixture/src/generate/javascript/packages/imports/resolve/index.js',
                     output: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/resolve/partial/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/resolve/partial/.dts'
                     },
                     importsResolve: { importKeys: ['#importsForTesting/*'] }
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/resolve/partial/index.d.ts',
                    'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/no-bundlePackageExports/imports/resolve/partial/index.d.ts');
               });

               it(`(imports / installed)`, async () =>
               {
                  const success = await generateDTS({
                     input: './test/fixture/src/generate/javascript/packages/imports/resolve/installed/index.js',
                     output: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/resolve/installed/index.d.ts',
                     logLevel: 'debug',
                     compilerOptions: {
                        outDir: './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/resolve/installed/.dts'
                     },
                     importsResolve: true
                  });

                  expect(success).toBe(true);

                  const result = fs.readFileSync(
                   './test/fixture/output/generate/javascript/packages/no-bundlePackageExports/imports/resolve/installed/index.d.ts', 'utf-8');

                  expect(result).toMatchFileSnapshot(
                   '../../fixture/snapshot/generate/javascript/packages/no-bundlePackageExports/imports/resolve/installed/index.d.ts');
               });
            });
         });
      });
   });
});
