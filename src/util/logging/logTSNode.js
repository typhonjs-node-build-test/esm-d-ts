import ts            from 'typescript';

import { isObject }  from '@typhonjs-utils/object';

import { logger }    from '#util';

/**
 * A convenience function to post a debug log message via the `logger` for a Typescript AST node. You may select other
 * valid log levels. This is handy when debugging AST transformer development.
 *
 * @param {ts.Node}  node - Typescript AST node to log.
 *
 * @param {'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'trace'} [logLevel='debug'] Optional alternate
 *        logging level.
 */
export function logTSNode(node, logLevel = 'debug')
{
   if (!isObject(node) || typeof node?.kind !== 'number')
   {
      logger.error(`[logTSNode] node is not a Typescript AST node.`);
      return;
   }

   if (!logger.isValidLevel(logLevel))
   {
      logger.error(`[logTSNode] logLevel 'debug' is not a valid log level`);
      return;
   }

   // Create a printer to print the node
   const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

   // Create a source file to act as a context for printing
   const sourceFile = ts.createSourceFile('null.ts', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);

   // Print the node
   const result = printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);

   logger[logLevel](result);
}
