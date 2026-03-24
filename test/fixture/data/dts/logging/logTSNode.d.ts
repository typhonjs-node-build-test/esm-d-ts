/**
 * A convenience function to post a debug log message via the `logger` for a Typescript AST node. You may select other
 * valid log levels. This is handy when debugging AST transformer development.
 *
 * @param {ts.Node}  node - Typescript AST node to log.
 *
 * @param {'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'trace'} [logLevel='debug'] Optional alternate
 *        logging level.
 */
export function logTSNode(node: ts.Node, logLevel?: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'trace'): void;
import ts from 'typescript';
