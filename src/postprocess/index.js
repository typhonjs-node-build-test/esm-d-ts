export * from './external/index.js';
export * from './GraphAnalysis.js';
export * from './PostProcess.js';

/**
 * @typedef {((params: {
 *       Logger?: import('@typhonjs-build-test/esm-d-ts/util').Logger,
 *       sourceFile?: import('ts-morph').SourceFile,
 *       inheritance?: import('./GraphAnalysis').GraphAnalysis<import('ts-morph').ClassDeclaration>
 *    }) => void
 * )} ProcessorFunction A processor function that optionally receives the Logger, sourceFile (ts-morph), and
 *                      inheritance graph.
 */
