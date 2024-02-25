/* eslint no-undef: "off" */
import {
   beforeAll,
   expect }             from 'vitest';

import fs               from 'fs-extra';

import { generateDTS }  from '../../../src/generator/index.js';

import {
   processInheritDoc,
   PostProcess }        from '../../../src/postprocess/index.js';

describe('PostProcess', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/postprocess/processInheritDoc/valid');
      fs.emptyDirSync('./test/fixture/output/postprocess/processInheritDoc/valid');
      fs.ensureDirSync('./test/fixture/output/postprocess/processInheritDoc/valid/direct');
   });

   describe('processInheritDoc', () =>
   {
      it('direct', () =>
      {
         PostProcess.process({
            filepath: './test/fixture/src/postprocess/processInheritDoc/valid/direct/index.d.ts',
            output: './test/fixture/output/postprocess/processInheritDoc/valid/direct/index.d.ts',
            dependencies: true,
            processors: [processInheritDoc]
         });

         const result = fs.readFileSync('./test/fixture/output/postprocess/processInheritDoc/valid/direct/index.d.ts',
          'utf-8');

         expect(result).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/valid/direct/index.d.ts');
      });

      it('simple - generateDTS() -> processInheritDoc -> outputGraph - outputPostprocess', async () =>
      {
         await generateDTS({
            input: './test/fixture/src/postprocess/processInheritDoc/valid/simple/index.js',
            output: './test/fixture/output/postprocess/processInheritDoc/valid/simple/index.d.ts',
            logLevel: 'debug',
            compilerOptions: { outDir: './test/fixture/output/postprocess/processInheritDoc/valid/simple/.dts' },
            postprocess: [processInheritDoc],
            outputGraph: './test/fixture/output/postprocess/processInheritDoc/valid/simple/graph.json',
            outputGraphIndentation: 3,
            outputPostprocess: './test/fixture/output/postprocess/processInheritDoc/valid/simple/postprocess.d.ts'
         });

         // Verify non-postprocessed output.
         const resultIndex = fs.readFileSync(
          './test/fixture/output/postprocess/processInheritDoc/valid/simple/index.d.ts', 'utf-8');

         expect(resultIndex).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/valid/simple/index.d.ts');

         // Verify postprocess output.
         const resultPostprocess = fs.readFileSync(
          './test/fixture/output/postprocess/processInheritDoc/valid/simple/postprocess.d.ts', 'utf-8');

         expect(resultPostprocess).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/valid/simple/postprocess.d.ts');

         // Verify graph output.
         const resultGraph = JSON.parse(fs.readFileSync(
          './test/fixture/output/postprocess/processInheritDoc/valid/simple/graph.json', 'utf-8'));

         expect(resultGraph[3].id).is.a('string');
         expect(resultGraph[4].id).is.a('string');

         // ID is a generated UUID, so delete them before snapshot testing.
         delete resultGraph[3].id;
         delete resultGraph[4].id;

         expect(JSON.stringify(resultGraph, null, 3)).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/valid/simple/graph.json');
      });
   });
});
