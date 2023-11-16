import cytoscape from 'cytoscape';
import * as ts_morph from 'ts-morph';

declare class GraphAnalysis {
    constructor({ graph, nodes }: {
        graph: any;
        nodes: any;
    });
    /**
     * @returns {import('cytoscape').Core} The cytoscape core instance.
     */
    get cy(): cytoscape.Core;
    get nodes(): any;
    /**
     * Perform a depth first search of the graph.
     *
     * @param {import('cytoscape').SearchVisitFunction}  visit - A cytoscape search visit function.
     */
    dfs(visit: cytoscape.SearchVisitFunction): void;
    #private;
}

declare class PostProcess {
    /**
     * @param {object}   options - Options
     *
     * @param {string}   options.filepath - Source DTS file to process.
     *
     * @param {string}   [options.output] - Alternate output file path for testing.
     *
     * @param {Iterable<import('./').ProcessorFunction>}   [options.processors] - List of processor functions.
     */
    static process({ filepath, output, processors }: {
        filepath: string;
        output?: string;
        processors?: Iterable<ProcessorFunction>;
    }): void;
}

type ProcessorFunction = (params: {
    sourceFile?: ts_morph.SourceFile;
    inheritance?: GraphAnalysis;
}) => void;

export { GraphAnalysis, PostProcess, ProcessorFunction };