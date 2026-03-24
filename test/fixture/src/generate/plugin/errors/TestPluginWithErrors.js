/**
 * Tests plugin event callback failures by registering for an event defined by `testPluginEvent`. This sets that event
 * callback to throw an artificial error.
 */
class TestPluginWithErrors
{
   throwError()
   {
      throw new Error('Test Plugin Event Failure');
   }

   lexerTransform()
   {
      return 'export {};';
   }

   // Plugin manager registration ------------------------------------------------------------------------------------

   /**
    * @param {import('@typhonjs-plugin/manager').PluginInvokeEvent} ev -
    */
   onPluginLoad(ev)
   {
      const eventbus = ev.eventbus;
      const generateConfig = ev.pluginOptions;

      const options = { async: true };

      const testPluginEvent = generateConfig?.testPluginEvent;

      if (testPluginEvent !== 'lexer:transform:.ts')
      {
         eventbus.on('lexer:transform:.ts', this.lexerTransform, this, options);
      }

      // Event registration in the order which the events are fired.
      eventbus.on(testPluginEvent, this.throwError, this, options);
   }
}

const testPluginWithErrors = new TestPluginWithErrors()

export default testPluginWithErrors;
