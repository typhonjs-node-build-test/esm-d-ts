export * from './external/index.js';
export * from './GraphAnalysis.js';
export * from './PostProcess.js';
export * from '../util/logger.js';

/**
 * @typedef {((params: {
 *       Logger?: import('../util/logger').Logger,
 *       sourceFile?: import('ts-morph').SourceFile,
 *       inheritance?: import('./GraphAnalysis').GraphAnalysis
 *    }) => void
 * )} ProcessorFunction A processor function that optionally receives the Logger, sourceFile (ts-morph), and
 *                      inheritance graph.
 */
