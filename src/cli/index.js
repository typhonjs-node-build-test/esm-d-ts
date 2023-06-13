#!/usr/bin/env node
import { getPackage }   from '@typhonjs-utils/package-json';
import sade             from 'sade';

import {
   check,
   generate }           from './functions.js';

// Retrieve the `esm-d-ts` package.
const packageObj = getPackage({ filepath: import.meta.url });

const program = sade('esm-d-ts')
   .version(packageObj?.version);

program
   .command('check [input]', 'Output `checkJS` information')
   .describe('Runs Typescript with `checkJS` only outputting informational results.')
   .option('-c, --config', 'Provide a path to custom config.')
   .example('check src/index.js')
   .example('check -c (You may omit the source file when using a config file.)')
   .action(check);

program
   .command('generate [input]', 'Generate DTS', { alias: ['g', 'gen'] })
   .describe('Generate bundled DTS from source file. Expects an `index.js` entry file in ESM format.')
   .option('-c, --config', 'Provide a path to custom config.')
   .option('-o, --output', 'Provide a path to generated TS declaration output.', './types/index.d.ts')
   .example('generate src/index.js')
   .example('generate -c (You may omit the source file when using a config file.)')
   .action(generate);

program.parse(process.argv);
