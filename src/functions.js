import fs                     from 'fs-extra';
import module                 from 'module';

import alias                  from "@rollup/plugin-alias";
import { getPackageWithPath } from '@typhonjs-utils/package-json';
import { init, parse }        from 'es-module-lexer';
import { resolve }            from 'resolve.exports';
import { rollup }             from 'rollup';
import dts                    from 'rollup-plugin-dts';
import ts                     from 'typescript';
import upath                  from 'upath';

// const requireMod = module.createRequire(import.meta.url);
const requireMod = module.createRequire('file:///S:/program/Javascript/projects/TyphonJS/typhonjs-node-plugin/manager/node_modules/@typhonjs-build-test/esm-d-t/src/functions.js');

const s_REGEX_EXPORT = /^\s*export/;
const s_REGEX_PACKAGE = /^([a-z0-9-~][a-z0-9-._~]*)(\/[a-z0-9-._~/]*)*/;
const s_REGEX_PACKAGE_SCOPED = /^(@[a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-._~]*)(\/[a-z0-9-._~/]*)*/;

/**
 * Generates TS definitions from ESM source.
 *
 * @param {GenerateConfig}       config - The config used to generate TS definitions.
 *
 * @returns {Promise<void>}
 */
export async function generateTSDef(config)
{
   const { packages } = await parseFiles([config.main]);

   const packagePaths = {};
   const packageAlias = {};

   for (const packageName of packages)
   {
      const { packageDir, resolveDTS } = parsePackage(packageName, config);
      if (!resolveDTS)
      {
         console.warn(`generateTSDef warning: Could not locate TS declaration for '${packageName}'.`);
         continue;
      }
// console.log(upath.relative('./.dts', exportDTS));
      // packagePaths[packageName] = [`node_modules/${packageName}`];
console.log(resolveDTS);
console.log(packageDir);

      packagePaths[packageName] = ['./node_modules/@typhonjs-plugin/eventbus/types/index.d.ts'];
      // packagePaths[packageName] = [resolveDTS];
      // packagePaths[packageName] = ['../node_modules/@typhonjs-plugin/eventbus'];
   }

   const compilerOptions = Object.assign({}, config.compilerOptions || s_DEFAULT_TS_OPTIONS, { paths: packagePaths });

   fs.emptyDirSync('./.dts');

   const filePaths = Array.isArray(config.prependGen) ? [config.main, ...config.prependGen] : [config.main];
console.log(compilerOptions);
   compile(Array.from(filePaths), compilerOptions);

   const dtsMain = `./.dts/${upath.basename(config.main, upath.extname(config.main))}.d.ts`;
   console.log(dtsMain);

   // await bundleTS({ output: './types/index.d.ts', ...config, dtsMain });
}


/**
 * Parses top level exported packages retrieving any associated Typescript declaration file for the package.
 *
 * @param {string}         packageName - NPM package name.
 *
 * @param {GenerateConfig} config - The generate configuration.
 *
 * @returns {string} Returns any found TS declaration for the given package.
 */
function parsePackage(packageName, config)
{
   // Split the package name into base and an export path. match[1] is the package name; match[2] is the export path
   // which can be undefined if there is none.
   const match = packageName.startsWith('@') ? s_REGEX_PACKAGE_SCOPED.exec(packageName) :
    s_REGEX_PACKAGE.exec(packageName);

   if (!match) { return void 0; }

   const packagePath = `./${upath.relative('.', requireMod.resolve(`${match[1]}/package.json`))}`;
   const packageDir = `./${upath.relative('.', upath.dirname(packagePath))}`;

console.log(packagePath);
console.log(packageDir);

   const packageJSON = JSON.parse(fs.readFileSync(packagePath).toString());

   // Resolve any export path with `resolve.export`.
   const resolvePath = upath.join(packageDir, resolve(packageJSON, match[2], config.exportCondition));

   const resolveDTS = `./${upath.changeExt(resolvePath, '.d.ts')}`;

console.log(resolveDTS);

   // Found a TS declaration directly associated with the export.
   if (fs.existsSync(resolveDTS)) { return { packageDir, resolveDTS }; }

   const { packageObj, filepath } = getPackageWithPath({ filepath: resolvePath });

   // A specific subpackage export was specified, but no associated declaration found and the package.json found
   // is the root package, so a specific declaration for the subpackage is not resolved.
   if (match[2] !== void 0 && upath.relative('.', filepath) === packagePath) { return void 0; }

   return typeof packageObj.types === 'string' ? {
      packageDir,
      resolveDTS: `./${upath.join(packageDir, packageObj.types)}`
   } : void 0;
}

/**
 * Compiles TS declaration files from the provided list of ESM files.
 *
 * @param {Iterable<string>}  filePaths - A list of file paths to parse.
 *
 * @param {object}            options - TS compiler options.
 */
function compile(filePaths, options)
{
   delete options.paths;

   const host = ts.createCompilerHost(options);

   // Prepare and emit the d.ts files
   const program = ts.createProgram(Array.from(filePaths), options, host);
   program.emit();
}

/**
 * @param {GenerateConfig & {dtsMain: string}} config - The config used to generate TS definitions.
 *
 * @returns {Promise<void>}
 */
async function bundleTS(config)
{
   const rollupConfig = {
      input: {
         input: config.dtsMain,
         plugins: [
            // alias({
            //    entries: [
            //       {
            //          find: '@typhonjs-plugin/eventbus',
            //          replacement: './node_modules/@typhonjs-plugin/eventbus/types/index.d.ts'
            //       }
            //    ]
            // }),
            dts()
         ],
      },
      output: { file: config.output, format: "es" },
   };

   const bundle = await rollup(rollupConfig.input);

   await bundle.write(rollupConfig.output);

// closes the bundle
   await bundle.close();
}

const s_DEFAULT_TS_OPTIONS = {
   baseUrl: '.',
   allowJs: true,
   declaration: true,
   emitDeclarationOnly: true,

   // importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Preserve,
   moduleResolution: ts.ModuleResolutionKind.Node12,
   module: ts.ModuleKind.ES2022,
   target: ts.ScriptTarget.ES2021,
   outDir: './.dts'
};

/**
 * @typedef {object} GenerateConfig - Data used to generate TS definitions.
 *
 * @property {string}               main - The main entry ESM source path.
 *
 * @property {string}               [output='./types/index.d.ts'] - The bundled output TS definition path.
 *
 * @property {Iterable<string>}     [prependGen] - Generate TS definitions for these files prepending to bundled output.
 *
 * @property {Iterable<string>}     [prependString] - Directly prepend these strings to the bundled output.
 *
 * @property {object}               [compilerOptions] - Typescript compiler options.
 *
 * @property {object}               [exportCondition] - `resolve.exports` conditional options.
 */


/**
 * Parses all file paths provided. Includes top level "re-exported" packages in `packages` data.
 *
 * @param {Iterable<string>} filePaths - List of file paths to parse.
 *
 * @returns {Promise<{files: Set<string>, packages: Set<string>}>} Parsed files and top level packages exported.
 */
export async function parseFiles(filePaths)
{
   await init;

   const parsedFiles = new Set();

   const files = new Set();
   const packages = new Set();

   const parsePaths = (fileList, topLevel = false) =>
   {
      const toParseFiles = new Set();

      for (const file of fileList)
      {
         let resolved = upath.isAbsolute(file) ? file : upath.resolve(file);

         if (parsedFiles.has(resolved)) { continue; }

         parsedFiles.add(resolved);

         const dirpath = upath.dirname(resolved);

         if (!fs.existsSync(resolved))
         {
            if (fs.existsSync(`${resolved}.js`)) { resolved = `${resolved}.js`; }
            else if (fs.existsSync(`${resolved}.mjs`)) { resolved = `${resolved}.mjs`; }
            else
            {
               console.warn(`TSDefGenerator - parse warning: could not resolve: ${resolved}`);
               continue;
            }
         }

         files.add(resolved);

         const fileData = fs.readFileSync(resolved, 'utf-8').toString();

         const [imports] = parse(fileData);

         for (const data of imports)
         {
            if (data.n === void 0 || data.d === -2) { continue; }

            if (upath.isAbsolute(data.n))
            {
               toParseFiles.add(data.n);
               continue;
            }
            else if (data.n.startsWith('.'))
            {
               toParseFiles.add(upath.resolve(dirpath, data.n));
               continue;
            }

            const substring = fileData.substring(data.ss, data.se);

            // Only add packages exported from the top level as part of the public contract.
            if (topLevel && s_REGEX_EXPORT.exec(substring)) { packages.add(data.n); }
         }
      }

      if (toParseFiles.size > 0) { parsePaths(toParseFiles); }
   };

   parsePaths(filePaths, true);

   return { files, packages };
}
