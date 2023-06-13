import * as rollup from 'rollup';
import * as ts from 'typescript';
import ts__default from 'typescript';
import * as _typhonjs_build_test_rollup_plugin_pkg_imports from '@typhonjs-build-test/rollup-plugin-pkg-imports';
import * as resolve_exports from 'resolve.exports';

/**
 * Data used to generate the bundled TS declaration.
 */
type GenerateConfig = {
    input: string;
} & GeneratePluginConfig;
/**
 * Data used to generate the bundled TS declaration.
 */
type GeneratePluginConfig = {
    /**
     * The input entry ESM source path.
     */
    input?: string;
    /**
     * The bundled output TS declaration path.
     */
    output?: string;
    /**
     * When true attempt to bundle types of top level
     * exported packages. This is useful for re-bundling libraries.
     */
    bundlePackageExports?: boolean;
    /**
     * When true and bundling top level package exports check
     * for `index.d.ts` in package root.
     */
    checkDefaultPath?: boolean;
    /**
     * When true set `checkJs` to default compiler options. This is a
     * convenience parameter to quickly turn `checkJs` on / off.
     */
    checkJs?: boolean;
    /**
     * `resolve.exports` conditional options for
     * `package.json` exports field type.
     */
    exportCondition?: resolve_exports.Options;
    /**
     * By default
     * `jsdocRemoveNodeByTags('internal')` transformer is automatically added removing all AST nodes that have the
     * `@internal` tag. To generate declarations with internal tags set to `false` / null / undefined.
     */
    filterTags?: string | Iterable<string> | false | null | undefined;
    /**
     * Options to configure `@typhonjs-build-test/rollup-plugin-pkg-imports` `importsExternal` plugin.
     */
    importsExternalOptions?: _typhonjs_build_test_rollup_plugin_pkg_imports.ImportsPluginOptions;
    /**
     * Options to configure `@typhonjs-build-test/rollup-plugin-pkg-imports` `importsResolve` plugin.
     */
    importsResolveOptions?: _typhonjs_build_test_rollup_plugin_pkg_imports.ImportsPluginOptions;
    /**
     * The bundled output TS declaration file extension. Normally a
     * complete `output` path is provided when using `generateDTS`, but this can be useful when using the Rollup plugin to
     * change the extension as desired.
     */
    outputExt?: string;
    /**
     * Directly prepend these files to the bundled output. The files are
     * first attempted to be resolved relative to the entry point folder allowing a common configuration to be applied
     * across multiple subpath exports. Then a second attempt is made with the path provided.
     */
    prependFiles?: Iterable<string>;
    /**
     * Directly prepend these strings to the bundled output.
     */
    prependString?: Iterable<string>;
    /**
     * When true a custom transformer is added to remove the
     * renaming of private static class members that Typescript currently renames.
     */
    removePrivateStatic?: boolean;
    /**
     * Options for naive text replacement operating on the final bundled
     * TS declaration file.
     *
     * // Typescript specific options for compilation --------------------------------------------------------------------
     */
    replace?: Record<string, string>;
    /**
     * Typescript compiler options.
     * {@link https://www.typescriptlang.org/tsconfig}
     */
    compilerOptions?: ts__default.CompilerOptions;
    /**
     * Optional
     * filter function to handle diagnostic messages in a similar manner as the `onwarn` Rollup callback. Return `true` to
     * filter the given diagnostic from posting to `console.error`.
     */
    filterDiagnostic?: (diagnostic: ts.Diagnostic, message?: string) => boolean;
    /**
     * A list of TransformerFactory or CustomTransformerFactory functions to process generated declaration AST while
     * emitting intermediate types for bundling. {@link https://github.com/itsdouges/typescript-transformer-handbook}
     *
     * // Rollup specific options that are the same as Rollup configuration options when bundling declaration file -------
     */
    transformers?: Iterable<ts__default.TransformerFactory<ts__default.Bundle | ts__default.SourceFile> | ts__default.CustomTransformerFactory>;
    /**
     * Rollup `external` option.
     * {@link https://rollupjs.org/configuration-options/#external}
     */
    external?: string | RegExp | (string | RegExp)[] | ((id: string, parentId: string, isResolved: boolean) => boolean);
    /**
     * Rollup `paths` option.
     * {@link https://rollupjs.org/configuration-options/#output-paths}
     */
    paths?: Record<string, string> | ((id: string) => string);
    /**
     * Rollup `onwarn`
     * option. {@link https://rollupjs.org/configuration-options/#onwarn}
     */
    onwarn?: (warning: rollup.RollupWarning, defaultHandler: (warning: string | rollup.RollupWarning) => void) => void;
};
/**
 * Contains the processed config and associated data.
 */
type ProcessedConfig = {
    /**
     * TS compiler options.
     */
    compilerOptions: ts__default.CompilerOptions;
    /**
     * Generate config w/ default data.
     */
    config: GenerateConfig;
    /**
     * A list of all file paths to compile.
     */
    filepaths: string[];
    /**
     * Top level packages exported from entry point.
     */
    packages: Set<string>;
    /**
     * The common path for all files referenced by input entry point.
     */
    parseFilesCommonPath: string;
    /**
     * A list of all TS files to add synthetic exports.
     */
    tsFilepaths: string[];
};
/**
 * Invokes TS compiler in `checkJS` mode without processing DTS.
 *
 * @param {GenerateConfig | Iterable<GenerateConfig>} config - Generation configuration object.
 *
 * @returns {Promise<void>}
 */
declare function checkDTS(config: GenerateConfig | Iterable<GenerateConfig>): Promise<void>;
/**
 * Generates TS declarations from ESM source.
 *
 * @param {GenerateConfig | Iterable<GenerateConfig>} config - Generation configuration object.
 *
 * @returns {Promise<void>}
 */
declare function generateDTS(config: GenerateConfig | Iterable<GenerateConfig>): Promise<void>;
declare namespace generateDTS {
    const plugin: (options?: GeneratePluginConfig) => rollup.Plugin;
}

export { GenerateConfig, GeneratePluginConfig, ProcessedConfig, checkDTS, generateDTS };
