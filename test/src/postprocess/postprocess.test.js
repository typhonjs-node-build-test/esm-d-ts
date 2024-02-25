/* eslint no-undef: "off" */
import {
   beforeAll,
   expect, vi
} from 'vitest';

import fs               from 'fs-extra';

import { generateDTS }  from '../../../src/generator/index.js';

import {
   processInheritDoc,
   PostProcess }        from '../../../src/postprocess/index.js';

describe('PostProcess', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/postprocess');
      fs.emptyDirSync('./test/fixture/output/postprocess');
      fs.ensureDirSync('./test/fixture/output/postprocess/processInheritDoc/direct');
   });

   describe('processInheritDoc', () =>
   {
      it('direct', () =>
      {
         PostProcess.process({
            filepath: './test/fixture/src/postprocess/processInheritDoc/direct/index.d.ts',
            output: './test/fixture/output/postprocess/processInheritDoc/direct/index.d.ts',
            dependencies: true,
            processors: [processInheritDoc]
         });

         const result = fs.readFileSync('./test/fixture/output/postprocess/processInheritDoc/direct/index.d.ts',
          'utf-8');

         expect(result).toMatchFileSnapshot('../../fixture/snapshot/postprocess/processInheritDoc/direct/index.d.ts');
      });

      it('simple - generateDTS() -> processInheritDoc -> outputGraph - outputPostprocess', async () =>
      {
         await generateDTS({
            input: './test/fixture/src/postprocess/processInheritDoc/simple/index.js',
            output: './test/fixture/output/postprocess/processInheritDoc/simple/index.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/postprocess/processInheritDoc/simple/.dts' },
            postprocess: [processInheritDoc],
            outputGraph: './test/fixture/output/postprocess/processInheritDoc/simple/graph.json',
            outputGraphIndentation: 3,
            outputPostprocess: './test/fixture/output/postprocess/processInheritDoc/simple/postprocess.d.ts'
         });

         // Verify non-postprocessed output.
         const resultIndex = fs.readFileSync('./test/fixture/output/postprocess/processInheritDoc/simple/index.d.ts',
          'utf-8');

         expect(resultIndex).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/simple/index.d.ts');

         // Verify postprocess output.
         const resultPostprocess = fs.readFileSync(
          './test/fixture/output/postprocess/processInheritDoc/simple/postprocess.d.ts', 'utf-8');

         expect(resultPostprocess).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/simple/postprocess.d.ts');

         // Verify graph output.
         const resultGraph = JSON.parse(fs.readFileSync(
          './test/fixture/output/postprocess/processInheritDoc/simple/graph.json', 'utf-8'));

         expect(resultGraph[3].id).is.a('string');
         expect(resultGraph[4].id).is.a('string');

         // ID is a generated UUID, so delete them before snapshot testing.
         delete resultGraph[3].id;
         delete resultGraph[4].id;

         expect(JSON.stringify(resultGraph, null, 3)).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/simple/graph.json');
      });

      it('warnings - generateDTS() -> processInheritDoc', async () =>
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
