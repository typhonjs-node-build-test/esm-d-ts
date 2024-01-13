import {
   processInheritDoc,
   PostProcess }           from '../../src/postprocess/index.js';

PostProcess.process({
   filepath: './test/fixture/index.d.ts',
   output: './test/output/index-mod.d.ts',
   processors: [processInheritDoc]
});

