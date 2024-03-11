// /* eslint no-undef: "off" */
import resolve          from '@rollup/plugin-node-resolve';
import {
   importsExternal,
   importsResolve }     from '@typhonjs-build-test/rollup-plugin-pkg-imports';
import fs               from 'fs-extra';
import { rollup }       from 'rollup';
import {
   beforeAll,
   expect }             from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

describe('Rollup Plugin Imports (generate)', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/generate/rollup/imports');
      fs.emptyDirSync('./test/fixture/output/generate/rollup/imports');
   });

   describe('importsResolve', () =>
   {
      describe('w/ generateDTS() options', () =>
      {
         it(`(direct / imports) w/ 'checkDefaultPath'`, async () =>
         {
            const generateConfig = {
               bundlePackageExports: true,
               checkDefaultPath: true,
               compilerOptions: {
                  outDir:
                   './test/fixture/output/generate/rollup/imports/generate-config/bundlePackageExports/resolve/.dts'
               },
               importsResolve: true
            };

            const rollupConfig = {
               input: {
                  input: './test/fixture/src/generate/javascript/packages/imports/resolve/index.js',
                  plugins: [
                     resolve(),
                     generateDTS.plugin(generateConfig)
                  ]
               },
               output: {
                  file: './test/fixture/output/generate/rollup/imports/generate-config/bundlePackageExports/resolve/index.js',
                  format: 'es',
               }
            };

            const bundle = await rollup(rollupConfig.input);
            await bundle.write(rollupConfig.output);
            await bundle.close();

            const result = fs.readFileSync(
             './test/fixture/output/generate/rollup/imports/generate-config/bundlePackageExports/resolve/index.d.ts',
             'utf-8');

            expect(result).toMatchFileSnapshot(
             '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/resolve/index.d.ts');
         });

         it(`(direct / imports partial) w/ 'importKeys option'`, async () =>
         {
            const generateConfig = {
               bundlePackageExports: true,
               checkDefaultPath: true,
               compilerOptions: {
                  outDir: './test/fixture/output/generate/rollup/imports/generate-config/bundlePackageExports/resolve/partial/.dts'
               },
               importsResolve: { importKeys: ['#importsForTesting/*'] }
            };

            const rollupConfig = {
               input: {
                  input: './test/fixture/src/generate/javascript/packages/imports/resolve/index.js',
                  plugins: [
                     resolve(),
                     generateDTS.plugin(generateConfig)
                  ]
               },
               output: {
                  file: './test/fixture/output/generate/rollup/imports/generate-config/bundlePackageExports/resolve/partial/index.js',
                  format: 'es',
               }
            };

            const bundle = await rollup(rollupConfig.input);
            await bundle.write(rollupConfig.output);
            await bundle.close();

            const result = fs.readFileSync(
             './test/fixture/output/generate/rollup/imports/generate-config/bundlePackageExports/resolve/partial/index.d.ts',
             'utf-8');

            expect(result).toMatchFileSnapshot(
             '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/resolve/partial/index.d.ts');
         });

         it(`(imports / installed)`, async () =>
         {
            const generateConfig = {
               bundlePackageExports: true,
               compilerOptions: {
                  outDir: './test/fixture/output/generate/rollup/imports/generate-config/bundlePackageExports/resolve/installed/.dts'
               },
               importsResolve: true
            };

            const rollupConfig = {
               input: {
                  input: './test/fixture/src/generate/javascript/packages/imports/resolve/installed/index.js',
                  plugins: [
                     resolve(),
                     generateDTS.plugin(generateConfig)
                  ]
               },
               output: {
                  file: './test/fixture/output/generate/rollup/imports/generate-config/bundlePackageExports/resolve/installed/index.js',
                  format: 'es',
               }
            };

            const bundle = await rollup(rollupConfig.input);
            await bundle.write(rollupConfig.output);
            await bundle.close();

            const result = fs.readFileSync(
             './test/fixture/output/generate/rollup/imports/generate-config/bundlePackageExports/resolve/installed/index.d.ts',
             'utf-8');

            expect(result).toMatchFileSnapshot(
             '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/resolve/installed/index.d.ts');
         });
      });

      describe('w/ external plugins', () =>
      {
         it(`(direct / imports) w/ 'checkDefaultPath'`, async () =>
         {
            const generateConfig = {
               bundlePackageExports: true,
               checkDefaultPath: true,
               compilerOptions: {
                  outDir:
                   './test/fixture/output/generate/rollup/imports/external-plugin/bundlePackageExports/resolve/.dts'
               }
            };

            const rollupConfig = {
               input: {
                  input: './test/fixture/src/generate/javascript/packages/imports/resolve/index.js',
                  plugins: [
                     importsResolve(),
                     resolve(),
                     generateDTS.plugin(generateConfig)
                  ]
               },
               output: {
                  file: './test/fixture/output/generate/rollup/imports/external-plugin/bundlePackageExports/resolve/index.js',
                  format: 'es',
               }
            };

            const bundle = await rollup(rollupConfig.input);
            await bundle.write(rollupConfig.output);
            await bundle.close();

            const result = fs.readFileSync(
             './test/fixture/output/generate/rollup/imports/external-plugin/bundlePackageExports/resolve/index.d.ts',
              'utf-8');

            expect(result).toMatchFileSnapshot(
             '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/resolve/index.d.ts');
         });

         it(`(direct / imports partial) w/ 'importKeys option'`, async () =>
         {
            const generateConfig = {
               bundlePackageExports: true,
               checkDefaultPath: true,
               compilerOptions: {
                  outDir: './test/fixture/output/generate/rollup/imports/external-plugin/bundlePackageExports/resolve/partial/.dts'
               }
            };

            const rollupConfig = {
               input: {
                  input: './test/fixture/src/generate/javascript/packages/imports/resolve/index.js',
                  plugins: [
                     importsResolve({ importKeys: ['#importsForTesting/*'] }),
                     resolve(),
                     generateDTS.plugin(generateConfig)
                  ]
               },
               output: {
                  file: './test/fixture/output/generate/rollup/imports/external-plugin/bundlePackageExports/resolve/partial/index.js',
                  format: 'es',
               }
            };

            const bundle = await rollup(rollupConfig.input);
            await bundle.write(rollupConfig.output);
            await bundle.close();

            const result = fs.readFileSync(
             './test/fixture/output/generate/rollup/imports/external-plugin/bundlePackageExports/resolve/partial/index.d.ts',
              'utf-8');

            expect(result).toMatchFileSnapshot(
             '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/resolve/partial/index.d.ts');
         });

         it(`(imports / installed)`, async () =>
         {
            const generateConfig = {
               bundlePackageExports: true,
               compilerOptions: {
                  outDir: './test/fixture/output/generate/rollup/imports/external-plugin/bundlePackageExports/resolve/installed/.dts'
               }
            };

            const rollupConfig = {
               input: {
                  input: './test/fixture/src/generate/javascript/packages/imports/resolve/installed/index.js',
                  plugins: [
                     importsResolve(),
                     resolve(),
                     generateDTS.plugin(generateConfig)
                  ]
               },
               output: {
                  file: './test/fixture/output/generate/rollup/imports/external-plugin/bundlePackageExports/resolve/installed/index.js',
                  format: 'es',
               }
            };

            const bundle = await rollup(rollupConfig.input);
            await bundle.write(rollupConfig.output);
            await bundle.close();

            const result = fs.readFileSync(
             './test/fixture/output/generate/rollup/imports/external-plugin/bundlePackageExports/resolve/installed/index.d.ts',
              'utf-8');

            expect(result).toMatchFileSnapshot(
             '../../fixture/snapshot/generate/javascript/packages/bundlePackageExports/imports/resolve/installed/index.d.ts');
         });
      });
   });
});
