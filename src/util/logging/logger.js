import { ColorLogger } from '@typhonjs-utils/logger-color';

/**
 * Provides a ColorLogger instance accessible across the package.
 *
 * @type {import('@typhonjs-utils/logger-color').ColorLogger}
 */
const logger = new ColorLogger({ tag: 'esm-d-ts' });

export { logger };
