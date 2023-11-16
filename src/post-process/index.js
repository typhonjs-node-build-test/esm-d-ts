export * from './GraphAnalysis.js';
export * from './PostProcess.js';

/**
 * @typedef {(
 *    (params: { sourceFile?: import('ts-morph').SourceFile, inheritance?: import('./GraphAnalysis').GraphAnalysis }) => void
 * )} ProcessorFunction
 */
