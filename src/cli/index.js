#!/usr/bin/env node
import { getPackage }   from '@typhonjs-utils/package-json';
import sade             from 'sade';

import {
   bundle,
   check,
   generate }           from './functions.js';

// Retrieve the `esm-d-ts` package.
const packageObj = getPackage({ filepath: import.meta.url });

const program = sade('esm-d-ts')
   .version(packageObj?.version)

   // Global options
   .option('-l, --loglevel', `Specify logging level: 'off', 'fatal', 'error', 'warn', 'info', 'debug', 'verbose', ` +
    `'trace', or 'all'.`);

program
   .command('bundle [input] [output]', 'Bundle DTS')
   .describe(`Provides a convenience command to bundle an existing Typescript declaration entry point.`)
   .example('bundle dist/index.d.ts dist/bundled.d.ts')
   .action(bundle);

program
   .command('check [input]', 'Check Source')
   .describe(`Logs 'checkJs' diagnostics. Runs Typescript compiler with 'checkJs' outputting only diagnostic logs. `)
   .option('-c, --config', `Provide a path to an 'esm-d-ts' configuration file.`)
   .option('-t, --tsconfig', `Provide a path to a 'tsconfig.json' file for custom compiler options.`)
   .example('check src/index.js')
   .example('check -c (You may omit the source file when using a config file.)')
   .action(check);

program
   .command('generate [input]', 'Generate DTS', { alias: ['g', 'gen'] })
   .describe('Generate bundled DTS from source file.')
   .option('-c, --config', `Provide a path to an 'esm-d-ts' configuration file.`)
   .option('--check', `Enable 'checkJs' diagnostic logging.`)
   .option('-o, --output', 'Provide a file path to generated TS declaration output.')
   .option('-t, --tsconfig', `Provide a path to a 'tsconfig.json' file for custom compiler options.`)
   .example('generate src/index.js')
   .example('generate src/index.js -o types/index.d.ts')
   .example('generate -c (You may omit the source file when using a config file.)')
   .action(generate);

program.parse(process.argv);
