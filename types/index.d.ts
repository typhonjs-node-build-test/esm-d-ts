/**
 * Generates TS definitions from ESM source.
 *
 * @param {GenerateConfig}       config - The config used to generate TS definitions.
 *
 * @returns {Promise<void>}
 */
declare function generateTSDef(config: GenerateConfig): Promise<void>;
/**
 * @typedef {object} GenerateConfig - Data used to generate TS definitions.
 *
 * @property {string}               main - The main entry ESM source path.
 *
 * @property {string}               [output='./types/index.d.ts'] - The bundled output TS definition path.
 *
 * @property {Iterable<string>}     [prependGen] - Generate TS definitions for these files prepending to bundled output.
 *
 * @property {Iterable<string>}     [prependString] - Directly prepend these strings to the bundled output.
 *
 * @property {object}               [compilerOptions] - Typescript compiler options.
 *
 * @property {object}               [exportCondition] - `resolve.exports` conditional options.
 */
/**
 * Parses all file paths provided. Includes top level "re-exported" packages in `packages` data.
 *
 * @param {Iterable<string>} filePaths - List of file paths to parse.
 *
 * @returns {Promise<{files: Set<string>, packages: Set<string>}>} Parsed files and top level packages exported.
 */
declare function parseFiles(filePaths: Iterable<string>): Promise<{
    files: Set<string>;
    packages: Set<string>;
}>;
/**
 * - Data used to generate TS definitions.
 */
type GenerateConfig = {
    /**
     * - The main entry ESM source path.
     */
    main: string;
    /**
     * - The bundled output TS definition path.
     */
    output?: string;
    /**
     * - Generate TS definitions for these files prepending to bundled output.
     */
    prependGen?: Iterable<string>;
    /**
     * - Directly prepend these strings to the bundled output.
     */
    prependString?: Iterable<string>;
    /**
     * - Typescript compiler options.
     */
    compilerOptions?: object;
    /**
     * - `resolve.exports` conditional options.
     */
    exportCondition?: object;
};

export { GenerateConfig, generateTSDef, parseFiles };
