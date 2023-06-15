/**
 * Provides a basic color logger supporting three levels of logging.
 */
export class Logger
{
   /**
    * Stores the log level name to level value.
    *
    * @type {{ error: number, warn: number, all: number }}
    */
   static #logLevels = {
      error: 2,
      warn: 1,
      all: 0
   };

   /**
    * Log an error message.
    *
    * @param {string} message - A message.
    */
   static error(message)
   {
      console.error(`[31m[esm-d-ts] ${message}[0m`);
   }

   /**
    * Log an info message.
    *
    * @param {string} message - A message.
    *
    * @param {string} configLevel - Config log level option.
    */
   static info(message, configLevel)
   {
      if (this.#logLevels[configLevel] > this.#logLevels.all) { return; }

      console.log(`[esm-d-ts] ${message}`);
   }

   /**
    * Log a warning message.
    *
    * @param {string} message - A message.
    *
    * @param {string} configLevel - Config log level option.
    */
   static warn(message, configLevel)
   {
      if (this.#logLevels[configLevel] > this.#logLevels.warn) { return; }

      console.warn(`[33m[esm-d-ts] ${message}[0m`);
   }
}
