import type {
   PostProcess,
   ProcessorFunction }                 from '@typhonjs-build-test/esm-d-ts/postprocess';

import type {
   ImportsPluginOptions,
   ImportsResolvePluginOptions }       from '@typhonjs-build-test/rollup-plugin-pkg-imports';

import type {
   ColorLogger,
   LogLevel }                          from '@typhonjs-utils/logger-color';

import type {
   PackageJson,
   TsConfigJson }                      from 'type-fest';

import type {
   Bundle,
   CompilerOptions,
   CustomTransformerFactory,
   Diagnostic,
   SourceFile,
   TransformerFactory }                from 'typescript';

/**
 * Data used to generate the bundled TS declaration.
 */
export type GenerateConfig = {
   /**
    * The input entry source file path.
    */
   input: string;

   /**
    * Output additional '.d.cts' file for strict Typescript adherence for packages that are dual ESM / CJS.
    */
   emitCTS?: boolean;

   /**
    * When true attempt to bundle types of top level exported packages. This is useful for re-bundling libraries.
    */
   bundlePackageExports?: boolean;

   /**
    * When true and bundling top level package exports via `bundlePackageExports` check for `index.d.ts` in the package
    * root; this is off by default as usually this is indicative of and older package not updated for `exports`
    * in `package.json`.
    */
   checkDefaultPath?: boolean;

   /**
    * `resolve.exports` conditional options for `package.json` imports field type.
    */
   conditionImports?: import('resolve.exports').Options;

   /**
    * Options for naive text replacement operating on the final bundled TS declaration file. The keys are converted
    * into RegExp instances so may be a valid pattern to match.
    */
   dtsReplace?: Record<string, string>;

   /**
    * By default, `jsdocRemoveNodeByTags('internal')` transformer is automatically added removing all AST nodes that
    * have the `@internal` tag. To generate declarations with internal tags set to `false` / null / undefined.
    */
   filterTags?: string | Iterable<string> | false | null | undefined;

   /**
    * When defined enables `importsExternal` from the `@typhonjs-build-test/rollup-plugin-pkg-imports` package.
    */
   importsExternal?: boolean | ImportsPluginOptions;

   /**
    * When defined enables `importsLocal` from the `@typhonjs-build-test/rollup-plugin-pkg-imports` package.
    */
   importsLocal?: boolean | ImportsPluginOptions;

   /**
    * When defined enables `importsResolve` from the `@typhonjs-build-test/rollup-plugin-pkg-imports` package.
    */
   importsResolve?: boolean | ImportsResolvePluginOptions;

   /**
    * Defines the logging level; default: `info`.
    */
   logLevel?: LogLevel;

   /**
    * The output file path for the bundled TS declarations.
    */
   output?: string;

   /**
    * The bundled output TS declaration file extension. Normally a complete `output` path is provided when using
    * `generateDTS`, but this can be useful when using the Rollup plugin to change the extension as desired.
    */
   outputExt?: string;

   /**
    * Outputs the package dependency graph to the given file path. The graph JSON is suitable for use in various graph
    * libraries like cytoscape / Svelte Flow / amongst others.
    */
   outputGraph?: string;

   /**
    * When outputting the dependency graph use this indentation value for the JSON output.
    */
   outputGraphIndentation?: number;

   /**
    * When postprocessing is configured this is a helpful debugging mechanism to output the postprocessed declarations
    * to a separate file making it easier to compare the results of any additional processing. You must specify a valid
    * file path.
    */
   outputPostprocess?: string;

   /**
    * An iterable list of NPM package names or local source files providing ESM plugins to load for additional file
    * type support. Official 1st party plugins installed will automatically load. Use `plugins` to load any 3rd party
    * plugins.
    */
   plugins?: Iterable<string>;

   /**
    * An iterable list of postprocessing functions. Note: This is experimental!
    */
   postprocess?: Iterable<ProcessorFunction>;

   /**
    * Directly prepend these files to the bundled output. The files are first attempted to be resolved relative to the
    * entry point folder allowing a common configuration to be applied across multiple subpath exports. Then a second
    * attempt is made with the path provided.
    */
   prependFiles?: Iterable<string>;

   /**
    * Directly prepend these strings to the bundled output.
    */
   prependString?: Iterable<string>;

   /**
    * When defined as "false" `prettier` is not executed on the bundled declaration output. Otherwise, you may provide
    * a custom `prettier` configuration object.
    */
   prettier?: boolean | import('prettier').Options;

   /**
    * When processing ESM and this option is true a custom transformer is added to remove the renaming of private
    * static class members that Typescript currently renames and improperly passes through to bundled declarations.
    * Default: `true`.
    */
   removePrivateStatic?: boolean;

   /**
    * Typescript compiler options.
    * {@link https://www.typescriptlang.org/tsconfig}
    */
   compilerOptions?: TsConfigJson.CompilerOptions;

   /**
    * When true set `checkJs` to default compiler options. This is a convenience parameter to quickly turn `checkJs`
    * on / off. Default: `false`.
    */
   tsCheckJs?: boolean;

   /**
    * Provide a file path to a `tsconfig.json` for custom `compilerOptions` configuration.
    */
   tsconfig?: string;

   /**
    * By default, all diagnostic errors that are external to the common root path from the `input` source file will be
    * filtered from diagnostic logging. Set to `true` to include all diagnostic errors in logging. If you set an
    * explicit diagnostic filter function via the `tsDiagnosticFilter` this option is ignored.
    */
   tsDiagnosticExternal?: boolean;

   /**
    * Optional filter function to handle diagnostic messages in a similar manner as the `onwarn` Rollup callback.
    * Return `true` to filter the given diagnostic from posting to `console.error` otherwise return false to include.
    *
    * @param params The TS Diagnostic to filter and associated message.
    */
   tsDiagnosticFilter?: (params: { diagnostic: Diagnostic, message?: string }) => boolean

   /**
    * When generating a DTS bundle you may opt to turn off any emitted TS compiler diagnostic messages; Default: `true`.
    */
   tsDiagnosticLog?: boolean;

   /**
    * When processing an ESM entry point and set to `true` all TS files located at the `input` path and all
    * subdirectories are included as synthetic exports in the generated declarations. Setting to `false` only includes
    * TS files in the direct `input` path.
    */
   tsFileWalk?: boolean;

   /**
    * A list of TransformerFactory or CustomTransformerFactory functions to process generated declaration AST while
    * emitting intermediate types for bundling. {@link https://github.com/itsdouges/typescript-transformer-handbook}
    */
   tsTransformers?: Iterable<TransformerFactory<Bundle | SourceFile> | CustomTransformerFactory>;

   /**
    * Rollup `external` option.
    * {@link https://rollupjs.org/configuration-options/#external}
    */
   rollupExternal?: (string | RegExp)[] | RegExp | string |
    ((id: string, parentId: string, isResolved: boolean) => boolean);

   /**
    * Rollup `paths` option.
    * {@link https://rollupjs.org/configuration-options/#output-paths}
    */
   rollupPaths?: Record<string, string> | ((id: string) => string);

   /**
    * Rollup `onwarn` option.
    * {@link https://rollupjs.org/configuration-options/#onwarn}
    *
    * @param warning - RollupLog warning.
    * @param defaultHandler - Default Rollup warning handler.
    */
   rollupOnwarn?: (warning: import('rollup').RollupLog,
    defaultHandler: (warning: string | import('rollup').RollupLog) => void) => void;

}

/**
 * Contains the processed config and associated data. This is internal data for an execution of `esm-d-ts` and is
 * relevant for `esm-d-ts` plugin authors.
 */
export type ProcessedConfig = {
   /**
    * A list of all file paths to compile.
    */
   compileFilepaths: string[];

   /**
    * TS compiler options.
    */
   compilerOptions: CompilerOptions;

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
    * Indicates if the Typescript mode / processing is enabled. This is true when the entry point is a Typescript file.
    */
   isTSMode: boolean;

   /**
    * The lexically parsed original file paths connected with the entry point.
    */
   lexerFilepaths: string[];

   /**
    * Contains local files referenced by `package.json` `imports` field.
    */
   localPackageImports: Map<string, string>;

   /**
    * Top level packages exported from entry point. Key is the identifier in source code / may be an `imports` alias /
    * value is the actual package identifier.
    */
   packages: Map<string, string>;

   /**
    * Closest `package.json` object from input source file.
    */
   packageObj: PackageJson;

   /**
    * When processing an ESM entry point this contains a list of all TS files to add synthetic exports.
    */
   tsFilepaths: string[];
}

/**
 * Defines all plugin event data and any associated return type signatures. `esm-d-ts` supports plugins for additional
 * file type processing that needs to be transformed to ESM for lexical analysis and potential transformation to
 * Typescript compatible file data before compilation. There is only one officially supported plugin at this time for
 * Svelte components.
 *
 * @see {@link https://www.npmjs.com/package/@typhonjs-build-test/esm-d-ts-plugin-svelte | @typhonjs-build-test/esm-d-ts-plugin-svelte}
 */
export declare namespace PluginEvent {
   /**
    * Event data passed for implementing plugin event functions.
    */
   export type Data = {
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
      }

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
      }

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
   }

   /**
    * Return types for implementing plugin event functions.
    */
   export type Returns = {
      /** Return true to filter the given diagnostic. */
      'compile:diagnostic:filter': boolean | Promise<boolean>;

      /** Any transformation to ESM for the given file type. */
      'lexer:transform': string | Promise<string>;
   }
}
