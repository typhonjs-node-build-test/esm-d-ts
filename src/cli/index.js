#!/usr/bin/env node
import { getPackage }   from '@typhonjs-utils/package-json';
import sade             from 'sade';

import {
   check,
   generate }           from './functions.js';

// Retrieve the `esm-d-ts` package.
const packageObj = getPackage({ filepath: import.meta.url });

const program = sade('esm-d-ts')
   .version(packageObj?.version)

   // Global options
   .option('-c, --config', 'Provide a path to custom config.')
   .option('-l, --loglevel', `Specify logging level: 'all', 'verbose', 'info', 'warn', or 'error'`)
   .option('-t, --tsconfig', `Provide a path to custom 'tsconfig.json' file.`);

program
   .command('check [input]')
   .describe(`Logs 'checkJs' diagnostics. Runs Typescript compiler with 'checkJs' outputting only diagnostic logs. ` +
    `Expects an entry point source file in ESM format.`)
   .example('check src/index.js')
   .example('check -c (You may omit the source file when using a config file.)')
   .action(check);

program
   .command('generate [input]', 'Generate DTS', { alias: ['g', 'gen'] })
   .describe('Generate bundled DTS from source file. Expects an entry point source file in ESM format.')
   .option('--check', `Enable 'checkJs' diagnostic logging.`)
   .option('-o, --output', 'Provide a file path to generated TS declaration output.')
   .example('generate src/index.js')
   .example('generate src/index.js -o types/index.d.ts')
   .example('generate -c (You may omit the source file when using a config file.)')
   .action(generate);

program.parse(process.argv);
