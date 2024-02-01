import type { PostProcess }   from '@typhonjs-build-test/esm-d-ts/postprocess';
import type {
   ColorLogger,
   LogLevel }                 from '@typhonjs-utils/logger-color';
import type { Diagnostic }    from 'typescript';

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
         processedConfig: import('.').ProcessedConfig;
      }

      /** Triggered just before declaration compilation allowing additional source code transformation. */
      'compile:transform': {
         /** `esm-d-ts` logger instance. */
         logger: ColorLogger;
         /** Stores in-memory transformed file data. The key is the file name and value is transformed source code. */
         memoryFiles: Map<string, string>;
         /** The processed `esm-d-ts` configuration. */
         processedConfig: import('.').ProcessedConfig;
      };

      /** Triggered during lexical analysis allowing plugins to transform file data to ESM. */
      'lexer:transform': {
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
         processedConfig: import('.').ProcessedConfig;
      };

      /** Triggered at the start of processing. */
      'lifecycle:start': {
         /** The processed `esm-d-ts` configuration. */
         processedConfig: import('.').ProcessedConfig;
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
