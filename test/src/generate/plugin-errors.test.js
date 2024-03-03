// /* eslint no-undef: "off" */
import fs         from 'fs-extra';

import {
   beforeAll,
   expect,
   vi }           from 'vitest';

import {
   checkDTS,
   generateDTS }  from '../../../src/generator/index.js';

const pluginEvents = [
   'lifecycle:start',
   'lexer:transform:.ts',
   'compile:transform',
   'compile:diagnostic:filter',
   'compile:end',
   'lifecycle:end'
];

describe('Plugin Errors (generate)', () =>
{
   beforeAll(() =>
   {
      fs.ensureDirSync('./test/fixture/output/plugin/errors');
      fs.emptyDirSync('./test/fixture/output/plugin/errors');
   });

   describe('checkDTS()', () =>
   {
      describe('event callback errors', () =>
      {
         for (const event of pluginEvents)
         {
            it(event, async () =>
            {
               const consoleLog = [];
               vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

               const result = await checkDTS({
                  input: './test/fixture/src/generate/plugin/errors/index.js',
                  compilerOptions: { outDir: './test/fixture/output/generate/plugin/errors/checkDTS/.dts' },
                  plugins: ['./test/fixture/src/generate/plugin/errors/TestPluginWithErrors.js'],
                  testPluginEvent: event
               });

               expect(result).toBe(false);

               vi.restoreAllMocks();

               const filename = `event_${event.replaceAll(':', '-')}_console-log.json`;

               expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
                `../../fixture/snapshot/generate/plugin/errors/checkDTS/${filename}`);
            });
         }
      });
   });

   describe('generateDTS()', () =>
   {
      describe('event callback errors', () =>
      {
         for (const event of pluginEvents)
         {
            it(event, async () =>
            {
               const consoleLog = [];
               vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

               const result = await generateDTS({
                  input: './test/fixture/src/generate/plugin/errors/index.js',
                  output: './test/fixture/output/generate/plugin/errors/index.d.ts',
                  compilerOptions: { outDir: './test/fixture/output/generate/plugin/errors/generateDTS/.dts' },
                  tsCheckJs: event === 'compile:diagnostic:filter',  // Creates a diagnostic warning for `index.js`.
                  plugins: ['./test/fixture/src/generate/plugin/errors/TestPluginWithErrors.js'],
                  testPluginEvent: event
               });

               expect(result).toBe(false);

               vi.restoreAllMocks();

               const filename = `event_${event.replaceAll(':', '-')}_console-log.json`;

               expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
                `../../fixture/snapshot/generate/plugin/errors/generateDTS/${filename}`);
            });
         }
      });
   });
});
