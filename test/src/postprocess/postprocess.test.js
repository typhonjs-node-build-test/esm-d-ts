/* eslint no-undef: "off" */

import fs         from 'fs-extra';

import {
   processInheritDoc,
   PostProcess }  from '../../../src/postprocess/index.js';

describe('PostProcess', () =>
{
   it('processInheritDoc', () =>
   {
      fs.ensureDirSync('./test/fixture/output/postprocess');
      fs.emptyDirSync('./test/fixture/output/postprocess');

      PostProcess.process({
         filepath: './test/fixture/src/postprocess/index.d.ts',
         output: './test/fixture/output/postprocess/index.d.ts',
         dependencies: true,
         processors: [processInheritDoc]
      });

      const result = fs.readFileSync('./test/fixture/output/postprocess/index.d.ts', 'utf-8');

      expect(result).toMatchFileSnapshot('../../fixture/snapshot/postprocess/index.d.ts');
   });
});
