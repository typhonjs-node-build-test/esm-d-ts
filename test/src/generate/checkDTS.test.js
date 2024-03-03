/* eslint no-undef: "off" */
import {
   expect,
   vi }              from 'vitest';

import { checkDTS }  from '../../../src/generator/index.js';

describe('checkDTS()', () =>
{
   describe('Javascript', () =>
   {
      it('type warning', async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         const success = await checkDTS({ input: './test/fixture/src/generate/javascript/type-warning/index.js' });

         vi.restoreAllMocks();

         expect(success).toBe(true);

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          `../../fixture/snapshot/generate/javascript/type-warning/warning-console-log.json`);
      });

      it('type warning w/ iterable config (error)', async () =>
      {
         const consoleLog = [];
         vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

         const config = [
            { input: './test/fixture/src/generate/javascript/type-warning/index.js' },
            null // This will produce an error in `processConfig`.
         ];

         const success = await checkDTS(config);

         vi.restoreAllMocks();

         // `null` config above will cause false to return indicating not all configs ran.
         expect(success).toBe(false);

         expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
          `../../fixture/snapshot/generate/javascript/type-warning/warning-iterable-console-log.json`);
      });
   });
});
