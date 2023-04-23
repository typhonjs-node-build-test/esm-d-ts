import * as rollup from 'rollup';
import * as ts from 'typescript';
import ts__default from 'typescript';
import * as _typhonjs_build_test_rollup_external_imports from '@typhonjs-build-test/rollup-external-imports';
import * as resolve_exports from 'resolve.exports';

/**
 * - Data used to generate the bundled TS
 *          declaration.
 */
type GenerateConfig = {
    input: string;
} & GeneratePluginConfig;
/**
 * - Data used to generate the bundled TS declaration.
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
     * exported packages. This is useful for re-bundling libraries.
     */
    bundlePackageExports?: boolean;
    /**
     * - When true and bundling top level package exports check
     * for `index.d.ts` in package root.
     */
    checkDefaultPath?: boolean;
    /**
     * - `resolve.exports` conditional options for
     * `package.json` exports field type.
     */
    exportCondition?: resolve_exports.Options;
    /**
     * -
     * Options to configure `@typhonjs-build-test/rollup-external-imports` plugin.
     */
    importsExternalOptions?: _typhonjs_build_test_rollup_external_imports.ImportsExternalOptions;
    /**
     * - The bundled output TS declaration file extension. Normally a
     * complete `output` path is provided when using `generateDTS`, but this can be useful when using the Rollup
     * plugin to change the extension as desired.
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
     *
     * // Typescript specific options for compilation --------------------------------------------------------------------
     */
    replace?: Record<string, string>;
    /**
     * - Typescript compiler options.
     * {@link https://www.typescriptlang.org/tsconfig}
     */
    compilerOptions?: ts__default.CompilerOptions;
    /**
     * - Optional
     * filter function to handle diagnostic messages in a similar manner as the `onwarn` Rollup callback. Return
     * `true` to filter the given diagnostic from posting to `console.error`.
     */
    filterDiagnostic?: (diagnostic: ts.Diagnostic, message?: string) => boolean;
    /**
     * A list of TransformerFactory or CustomTransformerFactory functions to process generated declaration AST
     * while emitting intermediate types for bundling.
     * {@link https://github.com/itsdouges/typescript-transformer-handbook}
     *
     * // Rollup specific options that are the same as Rollup configuration options when bundling declaration file -------
     */
    transformers?: Iterable<ts__default.TransformerFactory<ts__default.Bundle | ts__default.SourceFile> | ts__default.CustomTransformerFactory>;
    /**
     * - Rollup `external` option.
     * {@link https://rollupjs.org/configuration-options/#external}
     */
    external?: string | RegExp | (string | RegExp)[] | ((id: string, parentId: string, isResolved: boolean) => boolean);
    /**
     * - Rollup `paths` option.
     * {@link https://rollupjs.org/configuration-options/#output-paths}
     */
    paths?: Record<string, string> | ((id: string) => string);
    /**
     * - Rollup `onwarn` option.
     * {@link https://rollupjs.org/configuration-options/#onwarn}
     */
    onwarn: (warning: rollup.RollupWarning, defaultHandler: (warning: string | rollup.RollupWarning) => void) => void;
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
    const plugin: (arg0: GeneratePluginConfig | undefined) => rollup.Plugin;
}

export { GenerateConfig, GeneratePluginConfig, generateDTS };
