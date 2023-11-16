import * as cytoscape from 'cytoscape';
import * as ts_morph from 'ts-morph';

declare class GraphAnalysis {
    constructor({ graph, nodes }: {
        graph: any;
        nodes: any;
    });
    /**
     * @returns {import('cytoscape').Core} The cytoscape core instance.
     */
    get cytoscape(): cytoscape.Core;
    get nodes(): any;
    /**
     * Perform a depth first search of the graph.
     *
     * @param {import('cytoscape').SearchVisitFunction}  visit - A cytoscape search visit function.
     *
     * @param {object} [options] - Options.
     *
     * @param {boolean}  [options.directed] - A boolean indicating whether the algorithm should only go along edges
     *        from source to target
     */
    depthFirstSearch(visit: cytoscape.SearchVisitFunction, { directed }?: {
        directed?: boolean;
    }): void;
    #private;
}

/**
 * Provides a basic color logger supporting four levels of logging.
 */
declare class Logger {
    /**
     * @returns {boolean} Whether 'all' logging is enabled.
     */
    static get isAll(): boolean;
    /**
     * @returns {boolean} Whether 'error' logging is enabled.
     */
    static get isError(): boolean;
    /**
     * @returns {boolean} Whether 'info' logging is enabled.
     */
    static get isInfo(): boolean;
    /**
     * @returns {boolean} Whether 'verbose' logging is enabled.
     */
    static get isVerbose(): boolean;
    /**
     * @returns {boolean} Whether 'warn' logging is enabled.
     */
    static get isWarn(): boolean;
    /**
     * Checks if the given log level is valid.
     *
     * @param {'all' | 'verbose' | 'info' | 'warn' | 'error'}   logLevel - Log level to validate.
     *
     * @returns {boolean} Is log level valid.
     */
    static isValidLevel(logLevel: 'all' | 'verbose' | 'info' | 'warn' | 'error'): boolean;
    /**
     * @param {'all' | 'verbose' | 'info' | 'warn' | 'error'}   logLevel - Log level to set.
     */
    static set logLevel(arg: string);
    /**
     * @returns {string} Current log level.
     */
    static get logLevel(): string;
    /**
     * @returns {{[p: string]: number}} Returns all log levels object.
     */
    static get logLevels(): {
        [p: string]: number;
    };
    /**
     * Log an error message.
     *
     * @param {string} message - A message.
     */
    static error(message: string): void;
    /**
     * Log an info message.
     *
     * @param {string} message - A message.
     */
    static info(message: string): void;
    /**
     * Log a verbose message.
     *
     * @param {string} message - A message.
     */
    static verbose(message: string): void;
    /**
     * Log a warning message.
     *
     * @param {string} message - A message.
     */
    static warn(message: string): void;
}

/**
 * @type {import('../../src/postprocess').ProcessorFunction}
 */
declare function processInheritDoc({ Logger, inheritance }: {
    Logger: any;
    inheritance: any;
}): void;

declare class PostProcess {
    /**
     * Performs postprocessing on a given Typescript declaration file.
     *
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

/**
 * A processor function that optionally receives the Logger, sourceFile (ts-morph), and
 *                      inheritance graph.
 */
type ProcessorFunction = (params: {
    Logger?: Logger;
    sourceFile?: ts_morph.SourceFile;
    inheritance?: GraphAnalysis;
}) => void;

export { GraphAnalysis, Logger, PostProcess, type ProcessorFunction, processInheritDoc };
