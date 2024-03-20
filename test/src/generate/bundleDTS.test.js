/* eslint no-undef: "off" */
import fs             from 'fs-extra';
import {expect, vi} from 'vitest';

import { bundleDTS }  from '../../../src/generator/index.js';

describe('bundleDTS()', () =>
{
   it('bundles existing DTS', async () =>
   {
      const success = await bundleDTS({
         input: './test/fixture/data/dts/index.d.ts',
         output: './test/fixture/output/generate/bundle/bundled.d.ts'
      });

      expect(success).toBe(true);

      const result = fs.readFileSync('./test/fixture/output/generate/bundle/bundled.d.ts', 'utf-8');

      expect(result).toMatchFileSnapshot('../../fixture/snapshot/generate/bundle/bundled.d.ts');
   });

   it('config error (bad input path)', async () =>
   {
      const consoleLog = [];
      vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

      const success = await bundleDTS({
         input: './bad-path.d.ts',
         output: './test/fixture/output/generate/bundle/no-op.d.ts'
      });

      vi.restoreAllMocks();

      expect(success).toBe(false);

      expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
       `../../fixture/snapshot/generate/bundle/bad-path-warning-console-log.json`);
   });

   it('Rollup error (bad input path)', async () =>
   {
      const consoleLog = [];
      vi.spyOn(console, 'log').mockImplementation((...args) => consoleLog.push(args));

      const success = await bundleDTS({
         input: './test/fixture/data/dts/index.d.ts',
         output: './test/fixture/output/generate/bundle/no-op.d.ts',
         rollupExternal: () => { throw Error('Exception in Rollup processing'); }
      });

      vi.restoreAllMocks();

      expect(success).toBe(false);

      expect(JSON.stringify(consoleLog, null, 2)).toMatchFileSnapshot(
       `../../fixture/snapshot/generate/bundle/rollup-exception-console-log.json`);
   });
});
