import { ColorLogger } from '@typhonjs-utils/logger-color';

/**
 * Provides a ColorLogger instance accessible across the package.
 *
 * @type {import('@typhonjs-utils/logger-color').ColorLogger}
 * @see https://typhonjs-node-utils.github.io/logger-color/classes/_typhonjs_utils_logger_color.ColorLogger.html
 */
const logger = new ColorLogger({ tag: 'esm-d-ts' });

export { logger };
