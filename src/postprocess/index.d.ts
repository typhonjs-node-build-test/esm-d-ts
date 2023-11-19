/**
 * Provides support for postprocessing bundled type declarations.
 *
 * @module @typhonjs-build-test/esm-d-ts/postprocess
 */

import * as cytoscape from 'cytoscape';
import * as ts_morph from 'ts-morph';
import { ClassDeclaration, FunctionDeclaration, InterfaceDeclaration, TypeAliasDeclaration, VariableDeclaration } from 'ts-morph';
import * as _typhonjs_build_test_esm_d_ts_util from '@typhonjs-build-test/esm-d-ts/util';

/**
 * Provides a wrapper around a headless `cytoscape` instance loaded with the given graph data and node Map.
 *
 * A GraphAnalysis instance for the inheritance class structure is passed into the postprocessor
 * {@link ProcessorFunction} functions managed by {@link PostProcess}.
 *
 * @template N Nodes
 * @template [G=object[]] GraphJSON
 */
declare class GraphAnalysis<N, G = any[]> {
    /**
     * @param {object}         options - Options.
     *
     * @param {object[]}       options.graph - The graph data
     *
     * @param {Map<string, N>} options.nodes - The Node map.
     */
    constructor({ graph, nodes }: {
        graph: object[];
        nodes: Map<string, N>;
    });
    /**
     * @returns {import('cytoscape').Core} The cytoscape core instance.
     */
    get cytoscape(): cytoscape.Core;
    /**
     * @returns {Map<string, N>} The Node Map.
     */
    get nodes(): Map<string, N>;
    /**
     * Perform a breadth first search of the graph.
     *
     * @param {import('cytoscape').SearchVisitFunction}  visit - A cytoscape search visit function.
     *
     * @param {object}   [options] - Options.
     *
     * @param {boolean}  [options.directed=false] - A boolean indicating whether the algorithm should only go along edges
     *        from source to target.
     *
     * @param {string | Set<string>}   [options.type] - Specific type to retrieve.
     */
    bfs(visit: cytoscape.SearchVisitFunction, { directed, type }?: {
        directed?: boolean;
        type?: string | Set<string>;
    }): void;
    /**
     * Perform a depth first search of the graph.
     *
     * @param {import('cytoscape').SearchVisitFunction}  visit - A cytoscape search visit function.
     *
     * @param {object}   [options] - Options.
     *
     * @param {boolean}  [options.directed=false] - A boolean indicating whether the algorithm should only go along edges
     *        from source to target.
     *
     * @param {string | Set<string>}   [options.type] - Specific type to retrieve.
     */
    dfs(visit: cytoscape.SearchVisitFunction, { directed, type }?: {
        directed?: boolean;
        type?: string | Set<string>;
    }): void;
    /**
     * @returns {G} Returns a JSON array of the graph.
     */
    toJSON(): G;
    #private;
}

/**
 * Implements a postprocessor to support `@inheritDoc`. By making a depth first search across the inheritance graph
 * at every depth classes are processed for methods and constructor functions that have the `@inheritDoc` param. A
 * backward traversal is performed from the current class through parent inheritance to promote the types of the
 * parent class to child. `@inheritDoc` marked methods must have the same number of parameters as the parent
 * implementation. Warnings and generated and improperly formatted methods are skipped.
 *
 * This is necessary as Typescript / `tsc` does not support the `@inheritDoc` JSDoc tag and will mark the types for
 * all methods using it with `any`.
 *
 * You may enable `verbose` logging to see the graph traversal.
 *
 * @param {object} options - Options
 *
 * @param {import('@typhonjs-build-test/esm-d-ts/util').Logger} options.Logger - Logger class.
 *
 * @param {import('../GraphAnalysis.js').GraphAnalysis<import('../').DependencyNodes>} options.dependencies -
 *        Dependency graph
 */
declare function processInheritDoc({ Logger, dependencies }: {
    Logger: _typhonjs_build_test_esm_d_ts_util.Logger;
    dependencies: GraphAnalysis<DependencyNodes>;
}): void;

/**
 * Parses a bundled DTS file via a ts-morph source file for inheritance hierarchy data.
 */
declare class DependencyParser {
    /**
     * @param {import('ts-morph').SourceFile} sourceFile - DTS source file to parse.
     *
     * @param {Set<import('./').DependencyNodes>} typeSet - The declaration types to parse.
     *
     * @returns {{ graph: object[], nodes: Map<string, import('./').DependencyNodes> }} Inheritance graph and nodes.
     */
    static parse(sourceFile: ts_morph.SourceFile, typeSet: Set<DependencyNodes>): {
        graph: object[];
        nodes: Map<string, DependencyNodes>;
    };
}

/**
 * Provides management of execution of creating a `ts-morph` project and coordinating postprocessing
 * {@link ProcessorFunction} functions acting on the `ts-morph` SourceFile. The input `filepath` should be a bundled
 * Typescript declaration file. Any postprocessing is automatically saved to the same file.
 */
declare class PostProcess {
    /**
     * Performs postprocessing on a given Typescript declaration file in place. You may provide an alternate output
     * filepath to not overwrite the source file.
     *
     * @param {object}   options - Options
     *
     * @param {string}   options.filepath - Source DTS file to process.
     *
     * @param {string}   [options.output] - Alternate output filepath for testing.
     *
     * @param {Iterable<import('./').ProcessorFunction>}   options.processors - List of processor functions.
     */
    static process({ filepath, output, processors }: {
        filepath: string;
        output?: string;
        processors: Iterable<ProcessorFunction>;
    }): void;
}

/**
 * All declaration types / kinds included in the `dependencies` GraphAnalysis.
 */
type DependencyNodes = (ClassDeclaration | FunctionDeclaration | InterfaceDeclaration | TypeAliasDeclaration | VariableDeclaration);
/**
 * Defines the JSON output of the dependencies graph. Entries with `id` & `type` are nodes and
 * those with `source & `target` are edges.
 */
type DependencyGraphJSON = ({
    id: string;
    type: 'ClassDeclaration' | 'FunctionDeclaration' | 'InterfaceDeclaration' | 'TypeAliasDeclaration' | 'VariableDeclaration';
} | {
    id: string;
    source: string;
    target: string;
})[];
/**
 * A processor function that optionally receives the Logger, sourceFile (ts-morph), and
 *                      inheritance graph.
 */
type ProcessorFunction = (params: {
    Logger?: _typhonjs_build_test_esm_d_ts_util.Logger;
    sourceFile?: ts_morph.SourceFile;
    dependencies?: GraphAnalysis<DependencyNodes, DependencyGraphJSON>;
}) => void;

export { type DependencyGraphJSON, type DependencyNodes, DependencyParser, GraphAnalysis, PostProcess, type ProcessorFunction, processInheritDoc };
