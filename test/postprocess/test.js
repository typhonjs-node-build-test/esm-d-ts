import {
   processInheritDoc,
   PostProcess }           from '../../src/postprocess/index.js';

import { logger }          from '#util';

logger.setLogLevel('verbose');

PostProcess.process({
   filepath: './test/fixture/index.d.ts',
   output: './test/output/index-mod.d.ts',
   dependencies: true,
   processors: [processInheritDoc]
});

