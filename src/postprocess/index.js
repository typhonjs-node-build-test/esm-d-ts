import {
   ClassDeclaration,
   FunctionDeclaration,
   InterfaceDeclaration,
   TypeAliasDeclaration,
   VariableDeclaration }   from 'ts-morph';

/**
 * Provides support for postprocessing bundled type declarations.
 *
 * @module @typhonjs-build-test/esm-d-ts/postprocess
 */

export * from './external/index.js';
export * from './InheritanceParser.js';
export * from './GraphAnalysis.js';
export * from './PostProcess.js';

/**
 * @typedef {(
 *    ClassDeclaration | FunctionDeclaration | InterfaceDeclaration | TypeAliasDeclaration | VariableDeclaration
 * )} InheritanceNodes All declaration types / kinds included in the `inheritance` GraphAnalysis.
 */

/**
 * @typedef {(
 *    { id: string, type: 'ClassDeclaration' | 'FunctionDeclaration' | 'InterfaceDeclaration' | 'TypeAliasDeclaration' | 'VariableDeclaration' } |
 *    { id: string, source: string, target: string }
 * )[]} InheritanceGraph
 */

/**
 * @typedef {((params: {
 *       Logger?: import('@typhonjs-build-test/esm-d-ts/util').Logger,
 *       sourceFile?: import('ts-morph').SourceFile,
 *       inheritance?: import('./GraphAnalysis').GraphAnalysis<InheritanceNodes, InheritanceGraph>
 *    }) => void
 * )} ProcessorFunction A processor function that optionally receives the Logger, sourceFile (ts-morph), and
 *                      inheritance graph.
 */
