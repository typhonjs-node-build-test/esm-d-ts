import * as rollup from 'rollup';
import * as ts from 'typescript';
import ts__default from 'typescript';
import * as type_fest from 'type-fest';
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
     * When true attempt to bundle types of top level
     * exported packages. This is useful for re-bundling libraries.
     */
    bundlePackageExports?: boolean;
    /**
     * When true and bundling top level package exports via
     * `bundlePackageExports` check for `index.d.ts` in package root; this is off by default as usually this is indicative
     * of and older package not updated for `exports` in `package.json`.
     */
    checkDefaultPath?: boolean;
    /**
     * `resolve.exports` conditional options for
     * `package.json` exports field type.
     */
    conditionExports?: resolve_exports.Options;
    /**
     * `resolve.exports` conditional options for
     * `package.json` imports field type.
     */
    conditionImports?: resolve_exports.Options;
    /**
     * Options for naive text replacement operating on the final bundled
     * TS declaration file. The keys are converted into RegExp instances so may be a valid pattern to match.
     */
    dtsReplace?: Record<string, string>;
    /**
     * By default,
     * `jsdocRemoveNodeByTags('internal')` transformer is automatically added removing all AST nodes that have the
     * `@internal` tag. To generate declarations with internal tags set to `false` / null / undefined.
     */
    filterTags?: string | Iterable<string> | false | null | undefined;
    /**
     * When defined enables `importsExternal` from the `@typhonjs-build-test/rollup-plugin-pkg-imports` package.
     */
    importsExternal?: boolean | _typhonjs_build_test_rollup_plugin_pkg_imports.ImportsPluginOptions;
    /**
     * When defined enables `importsResolve` from the `@typhonjs-build-test/rollup-plugin-pkg-imports` package.
     */
    importsResolve?: boolean | _typhonjs_build_test_rollup_plugin_pkg_imports.ImportsPluginOptions;
    /**
     * Defines the logging level.
     */
    logLevel?: 'all' | 'verbose' | 'info' | 'warn' | 'error';
    /**
     * The output file path for the bundled TS declarations.
     */
    output?: string;
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
     * Typescript compiler options.
     * {@link https://www.typescriptlang.org/tsconfig}
     */
    compilerOptions?: type_fest.TsConfigJson.CompilerOptions;
    /**
     * When true set `checkJs` to default compiler options. This is a
     * convenience parameter to quickly turn `checkJs` on / off.
     */
    tsCheckJs?: boolean;
    /**
     * Provide a path to a `tsconfig.json` for `compilerOptions` configuration.
     */
    tsconfig?: string;
    /**
     * By default, all diagnostic errors that are external to the common
     * root path from the `input` source file will be filtered from diagnostic logging. Set to `true` to include all
     * diagnostic errors in logging. If you set an explicit diagnostic filter function via the `tsDiagnosticFilter` this
     * option is ignored.
     */
    tsDiagnosticExternal?: boolean;
    /**
     * Optional
     * filter function to handle diagnostic messages in a similar manner as the `onwarn` Rollup callback. Return `true` to
     * filter the given diagnostic from posting to `console.error` otherwise return false to include.
     */
    tsDiagnosticFilter?: (diagnostic: ts.Diagnostic, message?: string) => boolean;
    /**
     * When generating a DTS bundle you may opt to turn off any emitted TS
     * compiler diagnostic messages.
     */
    tsDiagnosticLog?: boolean;
    /**
     * A list of TransformerFactory or CustomTransformerFactory functions to process generated declaration AST while
     * emitting intermediate types for bundling. {@link https://github.com/itsdouges/typescript-transformer-handbook}
     */
    tsTransformers?: Iterable<ts__default.TransformerFactory<ts__default.Bundle | ts__default.SourceFile> | ts__default.CustomTransformerFactory>;
    /**
     * Rollup `external` option.
     * {@link https://rollupjs.org/configuration-options/#external}
     */
    rollupExternal?: string | RegExp | (string | RegExp)[] | ((id: string, parentId: string, isResolved: boolean) => boolean);
    /**
     * Rollup `paths` option.
     * {@link https://rollupjs.org/configuration-options/#output-paths}
     */
    rollupPaths?: Record<string, string> | ((id: string) => string);
    /**
     * Rollup `onwarn`
     * option. {@link https://rollupjs.org/configuration-options/#onwarn}
     */
    rollupOnwarn?: (warning: rollup.RollupWarning, defaultHandler: (warning: string | rollup.RollupWarning) => void) => void;
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
     * - The main output path for intermediate TS declarations generated.
     */
    dtsMainPath: string;
    /**
     * A list of all file paths to compile.
     */
    filepaths: string[];
    /**
     * Top level packages exported from entry point.
     */
    packages: Set<string>;
    /**
     * Relative directory of common project files path.
     */
    inputRelativeDir: string;
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
