/**
 * Generates TS definitions from ESM source.
 *
 * @param {GenerateConfig}       config - The config used to generate TS definitions.
 *
 * @returns {Promise<void>}
 */
declare function generateTSDef(config: GenerateConfig): Promise<void>;
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

export { GenerateConfig, generateTSDef };
