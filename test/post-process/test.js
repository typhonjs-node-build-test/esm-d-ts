import { PostProcess }           from '../../src/post-process/index.js';

import { processorInheritDoc }   from './processInheritDoc.js';

PostProcess.process({
   filepath: './test/fixture/index.d.ts',
   output: './test/output/index-mod.d.ts',
   processors: [processorInheritDoc]
});

