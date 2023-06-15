/**
 * Provides a basic color logger supporting four levels of logging.
 */
export class Logger
{
   /**
    * Stores the log level name to level value.
    *
    * @type {{ [key: string]: number }}
    */
   static logLevels = {
      all: 0,
      verbose: 0,
      info: 2,
      warn: 3,
      error: 4
   };

   static #checkLogLevel(level, configLevel)
   {
      return (this.logLevels[configLevel] ?? this.logLevels.info) > this.logLevels[level];
   }

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
      if (this.#checkLogLevel('info', configLevel)) { return; }

      console.log(`[esm-d-ts] ${message}`);
   }

   /**
    * Log a verbose message.
    *
    * @param {string} message - A message.
    *
    * @param {string} configLevel - Config log level option.
    */
   static verbose(message, configLevel)
   {
      if (this.#checkLogLevel('verbose', configLevel)) { return; }

      console.log(`[35m[esm-d-ts] ${message}[0m`);
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
      if (this.#checkLogLevel('warn', configLevel)) { return; }

      console.warn(`[33m[esm-d-ts] ${message}[0m`);
   }
}
