import ts   from 'typescript';

/**
 * Provides a plugin for `esm-d-ts` to generate declarations for all Typescript file formats.
 */
export class DTSPluginTypescript
{
   // Plugin event callbacks -----------------------------------------------------------------------------------------

   /**
    * Transpiles any Typescript supported file formats returning the JS code so that `es-module-lexer` can parse it.
    *
    * @param {import('../types').PluginEvent.Data['lexer:transform']} data - Event data.
    *
    * @returns {import('../types').PluginEvent.Returns['lexer:transform']} JS transpiled file data.
    */
   lexerTransform({ compilerOptions, fileData })
   {
      return ts.transpileModule(fileData, {
         compilerOptions: {
            ...compilerOptions,
            allowImportingTsExtensions: true,
            declaration: false
         },
         /* v8 ignore next 1 */
         jsDocParsingMode: ts?.JSDocParsingMode?.ParseNone ?? 1, // `ParseNone` added in `TS 5.3+`.
         reportDiagnostics: false

      }).outputText;
   }

   // Plugin manager registration ------------------------------------------------------------------------------------

   /**
    * @param {import('@typhonjs-plugin/manager').PluginInvokeEvent} ev -
    */
   onPluginLoad(ev)
   {
      const eventbus = ev.eventbus;

      const options = { async: true };

      // Event registration in the order which the events are fired.
      eventbus.on('lexer:transform:.cts', this.lexerTransform, this, options);
      eventbus.on('lexer:transform:.ctsx', this.lexerTransform, this, options);
      eventbus.on('lexer:transform:.jsx', this.lexerTransform, this, options);
      eventbus.on('lexer:transform:.mts', this.lexerTransform, this, options);
      eventbus.on('lexer:transform:.mtsx', this.lexerTransform, this, options);
      eventbus.on('lexer:transform:.ts', this.lexerTransform, this, options);
      eventbus.on('lexer:transform:.tsx', this.lexerTransform, this, options);
   }
}
