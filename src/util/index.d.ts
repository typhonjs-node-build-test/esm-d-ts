/**
 * Provides shared utilities including logging.
 *
 * @module @typhonjs-build-test/esm-d-ts/util
 */

/**
 * Provides a basic color logger supporting four levels of logging.
 */
declare class Logger {
    /**
     * @returns {boolean} Whether 'all' logging is enabled.
     */
    static get isAll(): boolean;
    /**
     * @returns {boolean} Whether 'error' logging is enabled.
     */
    static get isError(): boolean;
    /**
     * @returns {boolean} Whether 'info' logging is enabled.
     */
    static get isInfo(): boolean;
    /**
     * @returns {boolean} Whether 'verbose' logging is enabled.
     */
    static get isVerbose(): boolean;
    /**
     * @returns {boolean} Whether 'warn' logging is enabled.
     */
    static get isWarn(): boolean;
    /**
     * Checks if the given log level is valid.
     *
     * @param {'all' | 'verbose' | 'info' | 'warn' | 'error'}   logLevel - Log level to validate.
     *
     * @returns {boolean} Is log level valid.
     */
    static isValidLevel(logLevel: 'all' | 'verbose' | 'info' | 'warn' | 'error'): boolean;
    /**
     * @param {'all' | 'verbose' | 'info' | 'warn' | 'error'}   logLevel - Log level to set.
     */
    static set logLevel(arg: string);
    /**
     * @returns {string} Current log level.
     */
    static get logLevel(): string;
    /**
     * @returns {{[p: string]: number}} Returns all log levels object.
     */
    static get logLevels(): {
        [p: string]: number;
    };
    /**
     * Log an error message.
     *
     * @param {string} message - A message.
     */
    static error(message: string): void;
    /**
     * Log an info message.
     *
     * @param {string} message - A message.
     */
    static info(message: string): void;
    /**
     * Log a verbose message.
     *
     * @param {string} message - A message.
     */
    static verbose(message: string): void;
    /**
     * Log a warning message.
     *
     * @param {string} message - A message.
     */
    static warn(message: string): void;
}

export { Logger };
