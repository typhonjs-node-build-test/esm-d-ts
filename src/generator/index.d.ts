import * as rollup from 'rollup';
import * as resolve_exports from 'resolve.exports';
import ts from 'typescript';

/**
 * - Data used to generate TS declarations.
 */
type GenerateConfig = {
    input: string;
} & GeneratePluginConfig;
/**
 * - Data used to generate TS declaration.
 */
type GeneratePluginConfig = {
    /**
     * - The input entry ESM source path.
     */
    input?: string;
    /**
     * - The bundled output TS declaration path.
     */
    output?: string;
    /**
     * - When true attempt to bundle types of top level
     *    exported packages. This is useful for re-bundling
     *    libraries.
     */
    bundlePackageExports?: boolean;
    /**
     * - When true and bundling top level package exports check
     *    for `index.d.ts` in package root.
     */
    checkDefaultPath?: boolean;
    /**
     * - Typescript compiler options.
     */
    compilerOptions?: ts.CompilerOptions;
    /**
     * - `resolve.exports` conditional options.
     */
    exportCondition?: resolve_exports.Options;
    /**
     * - The bundled output TS declaration file extension.
     */
    outputExt?: string;
    /**
     * - Generate TS definitions for these files prepending to bundled output.
     */
    prependGen?: Iterable<string>;
    /**
     * - Directly prepend these strings to the bundled output.
     */
    prependString?: Iterable<string>;
    /**
     * - Options for naive text replacement operating on the final bundled
     * TS declaration file.
     */
    replace?: Record<string, string>;
    /**
     * -
     * A list of TransformerFactory or CustomTransformerFactory functions to process generated declaration AST
     * while emitting intermediate types for bundling.
     */
    transformers?: Iterable<ts.TransformerFactory<ts.Bundle | ts.SourceFile> | ts.CustomTransformerFactory>;
};
/**
 * Generates TS declarations from ESM source.
 *
 * @param {GenerateConfig} config - Generation configuration object.
 *
 * @returns {Promise<void>}
 */
declare function generateDTS(config: GenerateConfig): Promise<void>;
declare namespace generateDTS {
    const plugin: (config: GeneratePluginConfig) => rollup.Plugin;
}

export { GenerateConfig, GeneratePluginConfig, generateDTS };
