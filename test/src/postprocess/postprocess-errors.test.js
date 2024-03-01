/* eslint no-undef: "off" */
import fs               from 'fs-extra';

import {
   beforeAll,
   beforeEach,
   expect,
   vi }                 from 'vitest';

import { generateDTS }  from '../../../src/generator/index.js';

import {
   GraphAnalysis,
   PostProcess,
   processInheritDoc }  from '../../../src/postprocess/index.js';

import { logger }       from '#util';

describe('API Errors (postprocess)', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/postprocess/errors');
      fs.emptyDirSync('./test/fixture/output/postprocess/errors');
   });

   describe('GraphAnalysis', () =>
   {
      let graphAnalysis;

      beforeEach(() =>
      {
         graphAnalysis = new GraphAnalysis({ graph: [], nodes: new Map() });
      });

      describe('thrown errors', () =>
      {
         describe('bfs()', () =>
         {
            it(`'visit' is not function`, () =>
            {
               expect(() => graphAnalysis.bfs(null)).toThrowError(
                new TypeError(`'GraphAnalysis.bfs error: 'visit' is not a function.`));
            });

            it(`'direct' not boolean`, () =>
            {
               expect(() => graphAnalysis.bfs(() => null, { directed: null })).toThrowError(
                new TypeError(`'GraphAnalysis.bfs error: 'directed' is not a boolean.`));
            });

            it(`'type' not Set or string`, () =>
            {
               expect(() => graphAnalysis.bfs(() => null, { type: null })).toThrowError(
                new TypeError(`'GraphAnalysis.bfs error: 'type' is not a string or set of strings.`));
            });
         });

         describe('dfs()', () =>
         {
            it(`'visit' is not function`, () =>
            {
               expect(() => graphAnalysis.dfs(null)).toThrowError(
                new TypeError(`'GraphAnalysis.dfs error: 'visit' is not a function.`));
            });

            it(`'direct' not boolean`, () =>
            {
               expect(() => graphAnalysis.dfs(() => null, { directed: null })).toThrowError(
                new TypeError(`'GraphAnalysis.dfs error: 'directed' is not a boolean.`));
            });

            it(`'type' not Set or string`, () =>
            {
               expect(() => graphAnalysis.dfs(() => null, { type: null })).toThrowError(
                new TypeError(`'GraphAnalysis.dfs error: 'type' is not a string or set of strings.`));
            });
         });
      });
   });

   describe('PostProcess', () =>
   {
      describe('thrown errors', () =>
      {
         it('process - filepath is not a string', () =>
         {
            expect(() => PostProcess.process({ filepath: null })).toThrowError(
             new TypeError(`PostProcess.process error: 'filepath' is not a string.`));
         });

         it('process - filepath is not a file', () =>
         {
            expect(() => PostProcess.process({ filepath: 'bad-path.d.ts' })).toThrowError(
             new TypeError(`PostProcess.process error: 'filepath' does not exist:\nbad-path.d.ts`));
         });

         it('process - processors is not an iterable list', () =>
         {
            expect(() => PostProcess.process({
               filepath: './test/fixture/src/postprocess/processInheritDoc/valid/simple/index.js',
               processors: null
            })).toThrowError(new TypeError(`PostProcess.process error: 'processors' is not an iterable list.`));
         });

         it('process - dependencies is not a boolean', () =>
         {
            expect(() => PostProcess.process({
               filepath: './test/fixture/src/postprocess/processInheritDoc/valid/simple/index.js',
               processors: [],
               dependencies: 'bad'
            })).toThrowError(new TypeError(`PostProcess.process error: 'dependencies' is not a boolean.`));
         });

         it('process - logStart is not a boolean', () =>
         {
            expect(() => PostProcess.process({
               filepath: './test/fixture/src/postprocess/processInheritDoc/valid/simple/index.js',
               processors: [],
               dependencies: false,
               logStart: 'bad'
            })).toThrowError(new TypeError(`PostProcess.process error: 'logStart' is not a boolean.`));
         });

         it('process - output is not a string', () =>
         {
            expect(() => PostProcess.process({
               filepath: './test/fixture/src/postprocess/processInheritDoc/valid/simple/index.js',
               processors: [],
               dependencies: false,
               logStart: false,
               output: null
            })).toThrowError(new TypeError(`PostProcess.process error: 'output' is not a string.`));
         });
      });

      describe('logged error', () =>
      {
         it('process bad outputPostprocess path', async () =>
         {
            const consoleLog = [];
            vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

            await generateDTS({
               input: './test/fixture/src/postprocess/processInheritDoc/valid/simple/index.js',
               output: './test/fixture/output/postprocess/processInheritDoc/errors/simple/index.d.ts',
               logLevel: 'error',
               compilerOptions: { outDir: './test/fixture/output/postprocess/processInheritDoc/errors/simple/.dts' },
               postprocess: [processInheritDoc],
               outputPostprocess: './test/fixture/output/postprocess/processInheritDoc/errors/bad-path/error.d.ts'
            });

            vi.restoreAllMocks();

            expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
             '../../fixture/snapshot/postprocess/processInheritDoc/errors/outputPostprocess/console-log.json');
         });

         it('process - processors[0] throws', () =>
         {
            const consoleLog = [];
            vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

            logger.setLogLevel('error');

            PostProcess.process({
               filepath: './test/fixture/src/postprocess/Postprocess/warnings/no-op.d.ts',
               processors: [() => { throw new Error('A test error'); }],
               dependencies: false,
               logStart: false
            });

            vi.restoreAllMocks();

            expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
             '../../fixture/snapshot/postprocess/Postprocess/errors/processors/console-log.json');
         });
      });
   });

   describe('processInheritDoc', () =>
   {
      it('bad outputPostprocess path', async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         await generateDTS({
            input: './test/fixture/src/postprocess/processInheritDoc/valid/simple/index.js',
            output: './test/fixture/output/postprocess/processInheritDoc/errors/simple/index.d.ts',
            logLevel: 'error',
            compilerOptions: { outDir: './test/fixture/output/postprocess/processInheritDoc/errors/simple/.dts' },
            postprocess: [processInheritDoc],
            outputPostprocess: './test/fixture/output/postprocess/processInheritDoc/errors/bad-path/error.d.ts'
         });

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/errors/outputPostprocess/console-log.json');
      });

      it('bad outputGraph path', async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         await generateDTS({
            input: './test/fixture/src/postprocess/processInheritDoc/valid/simple/index.js',
            output: './test/fixture/output/postprocess/processInheritDoc/errors/outputGraph/index.d.ts',
            logLevel: 'error',
            compilerOptions: { outDir: './test/fixture/output/postprocess/processInheritDoc/errors/outputGraph/.dts' },
            postprocess: [processInheritDoc],
            outputGraph: './test/fixture/output/postprocess/processInheritDoc/errors/bad-path/error.json'
         });

         vi.restoreAllMocks();

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          '../../fixture/snapshot/postprocess/processInheritDoc/errors/outputGraph/console-log.json');
      });
   });
});
