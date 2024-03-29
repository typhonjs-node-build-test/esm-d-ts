/**
 * Provides support for postprocessing bundled type declarations.
 *
 * @module
 */

import {
   ClassDeclaration,
   FunctionDeclaration,
   InterfaceDeclaration,
   TypeAliasDeclaration,
   VariableDeclaration }   from 'ts-morph';

export * from './external/index.js';

export * from './DependencyParser.js';
export * from './GraphAnalysis.js';
export * from './PostProcess.js';

/**
 * @typedef {(
 *    ClassDeclaration | FunctionDeclaration | InterfaceDeclaration | TypeAliasDeclaration | VariableDeclaration
 * )} DependencyNodes All declaration types / kinds included in the `dependencies` GraphAnalysis.
 */

/**
 * @typedef {(
 *    { id: string, type: 'ClassDeclaration' | 'FunctionDeclaration' | 'InterfaceDeclaration' | 'TypeAliasDeclaration' | 'VariableDeclaration' } |
 *    { id: string, source: string, target: string }
 * )[]} DependencyGraphJSON Defines the JSON output of the dependencies graph. Entries with `id` & `type` are nodes and
 * those with `source` & `target` are edges.
 */

/**
 * @typedef {((params: {
 *       logger?: import('@typhonjs-utils/logger-color').ColorLogger,
 *       sourceFile?: import('ts-morph').SourceFile,
 *       dependencies?: import('./GraphAnalysis').GraphAnalysis<DependencyNodes, DependencyGraphJSON>
 *    }) => void
 * )} ProcessorFunction A processor function that optionally receives the Logger, sourceFile (ts-morph), and
 *                      dependencies graph.
 */
