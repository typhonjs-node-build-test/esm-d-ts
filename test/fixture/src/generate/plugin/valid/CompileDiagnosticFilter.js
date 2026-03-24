/**
 * Provides a basic plugin to filter / reject all diagnostic logs for `compile:diagnostic:filter`.
 */
class CompileDiagnosticFilter
{
   // Plugin manager registration ------------------------------------------------------------------------------------

   /**
    * Filters / rejects all diagnostic logs.
    *
    * @returns {boolean}
    */
   diagnosticFilter()
   {
      return true;
   }

   /**
    * @param {import('@typhonjs-plugin/manager').PluginInvokeEvent} ev -
    */
   onPluginLoad(ev)
   {
      const eventbus = ev.eventbus;

      const options = { async: true };

      eventbus.on('compile:diagnostic:filter', this.diagnosticFilter, this, options);
   }
}

const compileDiagnosticFilter = new CompileDiagnosticFilter()

export default compileDiagnosticFilter;
