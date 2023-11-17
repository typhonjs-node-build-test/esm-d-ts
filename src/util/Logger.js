/**
 * Provides a basic color logger supporting four levels of logging.
 */
export class Logger
{
   /**
    * Stores the current log level.
    *
    * @type {string}
    */
   static #logLevel = 'info';

   /**
    * Stores the log level name to level value.
    *
    * @type {{ [key: string]: number }}
    */
   static #logLevels = Object.freeze({
      all: 0,
      verbose: 0,
      info: 2,
      warn: 3,
      error: 4
   });

   /**
    * @returns {boolean} Whether 'all' logging is enabled.
    */
   static get isAll()
   {
      return this.#checkLogLevel(this.logLevels.all);
   }

   /**
    * @returns {boolean} Whether 'error' logging is enabled.
    */
   static get isError()
   {
      return this.#checkLogLevel(this.logLevels.error);
   }

   /**
    * @returns {boolean} Whether 'info' logging is enabled.
    */
   static get isInfo()
   {
      return this.#checkLogLevel(this.logLevels.info);
   }

   /**
    * @returns {boolean} Whether 'verbose' logging is enabled.
    */
   static get isVerbose()
   {
      return this.#checkLogLevel(this.logLevels.verbose);
   }

   /**
    * @returns {boolean} Whether 'warn' logging is enabled.
    */
   static get isWarn()
   {
      return this.#checkLogLevel(this.logLevels.warn);
   }

   /**
    * Checks if the given log level is valid.
    *
    * @param {'all' | 'verbose' | 'info' | 'warn' | 'error'}   logLevel - Log level to validate.
    *
    * @returns {boolean} Is log level valid.
    */
   static isValidLevel(logLevel)
   {
      return typeof this.logLevels[logLevel] === 'number';
   }

   /**
    * @returns {string} Current log level.
    */
   static get logLevel()
   {
      return this.#logLevel;
   }

   /**
    * @returns {{[p: string]: number}} Returns all log levels object.
    */
   static get logLevels()
   {
      return this.#logLevels;
   }

   /**
    * @param {'all' | 'verbose' | 'info' | 'warn' | 'error'}   logLevel - Log level to set.
    */
   static set logLevel(logLevel)
   {
      if (!this.isValidLevel(logLevel))
      {
         this.error(`Setting Logger.logLevel failed: unknown logLevel '${logLevel}'.`);
      }

      this.#logLevel = logLevel;
   }

   /**
    * @param {number}   level - Level to check.
    *
    * @returns {boolean} True if below log level; false to log.
    */
   static #checkLogLevel(level)
   {
      return (this.logLevels[this.#logLevel] ?? this.logLevels.info) <= level;
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
    */
   static info(message)
   {
      if (!this.#checkLogLevel(this.logLevels.info)) { return; }

      console.log(`[esm-d-ts] ${message}`);
   }

   /**
    * Log a verbose message.
    *
    * @param {string} message - A message.
    */
   static verbose(message)
   {
      if (!this.#checkLogLevel(this.logLevels.verbose)) { return; }

      console.log(`[35m[esm-d-ts] ${message}[0m`);
   }

   /**
    * Log a warning message.
    *
    * @param {string} message - A message.
    */
   static warn(message)
   {
      if (!this.#checkLogLevel(this.logLevels.warn)) { return; }

      console.warn(`[33m[esm-d-ts] ${message}[0m`);
   }
}
