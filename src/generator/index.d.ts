/**
 * Provides the main entry points to the package including `checkDTS` and `generateDTS`.
 *
 * @module
 */

import * as rollup from 'rollup';
import * as ts from 'typescript';
import ts__default, { Diagnostic, CompilerOptions } from 'typescript';
import * as type_fest from 'type-fest';
import * as prettier from 'prettier';
import * as _typhonjs_build_test_esm_d_ts_postprocess from '@typhonjs-build-test/esm-d-ts/postprocess';
import { PostProcess } from '@typhonjs-build-test/esm-d-ts/postprocess';
import * as _typhonjs_utils_logger_color from '@typhonjs-utils/logger-color';
import { LogLevel, ColorLogger } from '@typhonjs-utils/logger-color';
import * as _typhonjs_build_test_rollup_plugin_pkg_imports from '@typhonjs-build-test/rollup-plugin-pkg-imports';
import * as resolve_exports from 'resolve.exports';

/**
 * Defines all plugin event data and any associated return type signatures. `esm-d-ts` supports plugins for additional
 * file type processing that needs to be transformed to ESM for lexical analysis and potential transformation to
 * Typescript compatible file data before compilation. There is only one officially supported plugin at this time for
 * Svelte components.
 *
 * @see {@link https://www.npmjs.com/package/@typhonjs-build-test/esm-d-ts-plugin-svelte | @typhonjs-build-test/esm-d-ts-plugin-svelte}
 */
declare namespace PluginEvent {
  /**
   * Event data passed for implementing plugin event functions.
   */
  type Data = {
    /** Triggered to filter each diagnostic message raised during compilation. */
    'compile:diagnostic:filter': {
      diagnostic: Diagnostic;
      /** Helper to log the diagnostic at a different log level. */
      diagnosticLog: (diagnostic: Diagnostic, logLevel: LogLevel) => void;
      /** `esm-d-ts` logger instance. */
      logger: ColorLogger;
      /** The flattened diagnostic message. */
      message: string;
    };
    /** Triggered after compilation before final bundling allowing postprocessing of intermediate declarations */
    'compile:end': {
      /** `esm-d-ts` logger instance. */
      logger: ColorLogger;
      /** Stores in-memory transformed file data. The key is the file name and value is transformed source code. */
      memoryFiles: Map<string, string>;
      /** The `esm-d-ts` PostProcess manager. */
      PostProcess: typeof PostProcess;
      /** The processed `esm-d-ts` configuration. */
      processedConfig: ProcessedConfig;
    };
    /** Triggered just before declaration compilation allowing additional source code transformation. */
    'compile:transform': {
      /** `esm-d-ts` logger instance. */
      logger: ColorLogger;
      /** Stores in-memory transformed file data. The key is the file name and value is transformed source code. */
      memoryFiles: Map<string, string>;
      /** The processed `esm-d-ts` configuration. */
      processedConfig: ProcessedConfig;
    };
    /** Triggered during lexical analysis allowing plugins to transform file data to ESM. */
    'lexer:transform': {
      compilerOptions: CompilerOptions;
      /** The file data to potentially transform. */
      fileData: string;
      /** `esm-d-ts` logger instance. */
      logger: ColorLogger;
      /** The resolved path for the file being transformed. */
      resolvedPath: string;
    };
    /** Triggered at the end of processing. */
    'lifecycle:end': {
      /** The processed `esm-d-ts` configuration. */
      processedConfig: ProcessedConfig;
    };
    /** Triggered at the start of processing. */
    'lifecycle:start': {
      /** The processed `esm-d-ts` configuration. */
      processedConfig: ProcessedConfig;
    };
  };
  /**
   * Return types for implementing plugin event functions.
   */
  type Returns = {
    /** Return true to filter the given diagnostic. */
    'compile:diagnostic:filter': boolean | Promise<boolean>;
    /** Any transformation to ESM for the given file type. */
    'lexer:transform': string | Promise<string>;
  };
}

/**
 * Data used to generate the bundled TS declaration.
 */
type GenerateConfig = {
  /**
   * The input entry ESM source path.
   */
  input: string;
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
   * When defined enables `importsExternal` from the `@typhonjs-build-test/rollup-plugin-pkg-imports`
   * package.
   */
  importsExternal?: boolean | _typhonjs_build_test_rollup_plugin_pkg_imports.ImportsPluginOptions;
  /**
   * When defined enables `importsResolve` from the `@typhonjs-build-test/rollup-plugin-pkg-imports`
   * package.
   */
  importsResolve?: boolean | _typhonjs_build_test_rollup_plugin_pkg_imports.ImportsResolvePluginOptions;
  /**
   * Defines the logging level.
   */
  logLevel?: _typhonjs_utils_logger_color.LogLevel;
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
   * Outputs the package dependency graph to the given file path. The
   * graph JSON is suitable for use in various graph libraries like cytoscape / Svelte Flow / amongst others.
   */
  outputGraph?: string;
  /**
   * When outputting the dependency graph use this indentation
   * value for the JSON output.
   */
  outputGraphIndentation?: number;
  /**
   * When postprocessing is configured this is a helpful debugging
   * mechanism to output the postprocessed declarations to a separate file making it easier to compare the results of
   * any additional processing. You must specify a valid filepath.
   */
  outputPostprocess?: string;
  /**
   * An iterable list of NPM package names or local source files providing ESM
   * plugins to load for additional file type support. Official 1st party plugins installed will automatically load. Use
   * `plugins` to load any 3rd party plugins.
   */
  plugins?: Iterable<string>;
  /**
   * An
   * iterable list of postprocessing functions. Note: This is experimental!
   */
  postprocess?: Iterable<_typhonjs_build_test_esm_d_ts_postprocess.ProcessorFunction>;
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
   * When defined as "false" `prettier` is not executed on
   * the bundled declaration output. Otherwise, you may provide a custom `prettier` configuration object.
   */
  prettier?: boolean | prettier.Options;
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
   * Provide a path to a `tsconfig.json` for custom `compilerOptions` configuration.
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
   * Optional filter function to handle diagnostic messages in a similar manner as the `onwarn`
   * Rollup callback. Return `true` to filter the given diagnostic from posting to `console.error` otherwise return false
   * to include.
   */
  tsDiagnosticFilter?: (params: { diagnostic: ts.Diagnostic; message?: string }) => boolean;
  /**
   * When generating a DTS bundle you may opt to turn off any emitted TS
   * compiler diagnostic messages.
   */
  tsDiagnosticLog?: boolean;
  /**
   * When true all TS files located at the `input` path and all subdirectories
   * are included as synthetic exports in the generated declarations. Setting to false only includes TS files in the
   * direct `input` path.
   */
  tsFileWalk?: boolean;
  /**
   * A list of TransformerFactory or CustomTransformerFactory functions to process generated declaration AST while
   * emitting intermediate types for bundling. {@link https://github.com/itsdouges/typescript-transformer-handbook}
   */
  tsTransformers?: Iterable<
    ts__default.TransformerFactory<ts__default.Bundle | ts__default.SourceFile> | ts__default.CustomTransformerFactory
  >;
  /**
   * Rollup `external` option.
   * {@link https://rollupjs.org/configuration-options/#external}
   */
  rollupExternal?:
    | string
    | RegExp
    | (string | RegExp)[]
    | ((id: string, parentId: string, isResolved: boolean) => boolean);
  /**
   * Rollup `paths` option.
   * {@link https://rollupjs.org/configuration-options/#output-paths}
   */
  rollupPaths?: Record<string, string> | ((id: string) => string);
  /**
   * Rollup `onwarn`
   * option. {@link https://rollupjs.org/configuration-options/#onwarn}
   */
  rollupOnwarn?: (warning: rollup.RollupLog, defaultHandler: (warning: string | rollup.RollupLog) => void) => void;
};
/**
 * Contains the processed config and associated data.
 */
type ProcessedConfig = {
  /**
   * A list of all file paths to compile.
   */
  compileFilepaths: string[];
  /**
   * TS compiler options.
   */
  compilerOptions: ts__default.CompilerOptions;
  /**
   * The directory path for intermediate TS declarations generated.
   */
  dtsDirectoryPath: string;
  /**
   * The entry point path for intermediate TS declarations generated.
   */
  dtsEntryPath: string;
  /**
   * The original generate generateConfig w/ default data.
   */
  generateConfig: GenerateConfig;
  /**
   * Relative directory of common project files path.
   */
  inputRelativeDir: string;
  /**
   * Indicates if the Typescript mode / processing is enabled.
   */
  isTSMode: boolean;
  /**
   * The lexically parsed original file paths connected with the entry point.
   */
  lexerFilepaths: string[];
  /**
   * Top level packages exported from entry point.
   */
  packages: string[];
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
 * @returns {Promise<boolean>} All operations successful.
 */
declare function checkDTS(config: GenerateConfig | Iterable<GenerateConfig>): Promise<boolean>;
/**
 * Generates TS declarations from ESM source.
 *
 * @param {GenerateConfig | Iterable<GenerateConfig>} config - Generation configuration object.
 *
 * @returns {Promise<boolean>} All Operations successful.
 */
declare function generateDTS(config: GenerateConfig | Iterable<GenerateConfig>): Promise<boolean>;
declare namespace generateDTS {
  let plugin: (options?: Partial<GenerateConfig>) => rollup.Plugin<any>;
}

export { type GenerateConfig, PluginEvent, type ProcessedConfig, checkDTS, generateDTS };
