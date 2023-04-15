import fs                     from 'fs-extra';
import module                 from 'module';

import alias                  from "@rollup/plugin-alias";
import { commonPath }         from '@typhonjs-utils/file-util';
import { isIterable }         from '@typhonjs-utils/object';
import { getPackageWithPath } from '@typhonjs-utils/package-json';
import { init, parse }        from 'es-module-lexer';
import { exports }            from 'resolve.exports';
import { rollup }             from 'rollup';
import dts                    from 'rollup-plugin-dts';
import ts                     from 'typescript';
import upath                  from 'upath';

const requireMod = module.createRequire(import.meta.url);

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
   const compilerOptions = Object.assign({}, s_DEFAULT_TS_OPTIONS, config.compilerOptions);

   fs.emptyDirSync(compilerOptions.outDir);

   // Parse imports from package.json resolved from main entry point.
   const importMap = parsePackageImports(config.main);

   // Note: TS still doesn't seem to resolve import paths from `package.json`, so add any parsed import paths.
   const filePaths = Array.isArray(config.prependGen) ? [...config.prependGen, config.main, ...importMap.values()] :
    [config.main, ...importMap.values()];

   compile(Array.from(filePaths), compilerOptions);

   await bundleTS({ output: './types/index.d.ts', ...config, outDir: compilerOptions.outDir }, importMap);
}

/**
 * @param {GenerateConfig & {outDir: string}} config - The config used to generate TS definitions.
 *
 * @param {Map<string, string>} importMap - The parsed package.json import map.
 *
 * @returns {Promise<void>}
 */
async function bundleTS(config, importMap)
{
   // Parse main source file and gather any top level NPM packages that may be referenced.
   const { files, packages } = await parseFiles([config.main], importMap);

   const parseFilesCommonPath = commonPath(...files);

   // Find the common base path for all parsed files and find the relative path to the main source file.
   const mainRelativePath = parseFilesCommonPath !== '' ? upath.relative(parseFilesCommonPath, config.main) :
    upath.basename(config.main);

   // Get the main DTS entry point; append mainRelativePath after changing extensions to the compilerOptions outDir.
   const dtsMain = `${config.outDir}/${upath.changeExt(mainRelativePath, '.d.ts')}`;

   const packageAlias = typeof config.bundlePackageExports === 'boolean' && config.bundlePackageExports ?
    resolvePackageExports(packages, config) : [];

   let banner = '';

   if (isIterable(config.prependGen))
   {
      const cpath = commonPath(...config.prependGen, config.main);

      for (const prependGenPath of config.prependGen)
      {
         const prependDTSPath = `${config.outDir}/${upath.relative(cpath, upath.changeExt(prependGenPath, '.d.ts'))}`;

         if (!fs.existsSync(prependDTSPath))
         {
            console.warn(
             `esm-d-ts - bundleTS warning: '${prependGenPath}' did not resolve to an emitted TS declaration.`);
            continue;
         }

         banner += fs.readFileSync(prependDTSPath, 'utf-8');
      }
   }

   if (isIterable(config.prependString))
   {
      for (const prependStr of config.prependString) { banner += prependStr; }
   }

   const rollupConfig = {
      input: {
         input: dtsMain,
         plugins: [
            alias({ entries: packageAlias }),
            dts()
         ],
      },
      output: { banner, file: config.output, format: "es" },
   };

   const bundle = await rollup(rollupConfig.input);

   await bundle.write(rollupConfig.output);

   // closes the bundle
   await bundle.close();
}

/**
 * Attempt to resolve Typescript declarations for any packages and provide a correct alias for Rollup from the
 * outDir; default: `./.dts`. As of Typescript v5 it is necessary to copy the external NPM package types to the local
 * output directory.
 *
 * Note: This is useful for libraries that re-bundle NPM modules.
 *
 * @param {string[]} packages - List of top level exported packages.
 *
 * @param {GenerateConfig} config - The config object.
 *
 * @returns {string[]} Resolved local package types.
 */
function resolvePackageExports(packages, config)
{
   const packageAlias = [];

   for (const packageName of packages)
   {
      const resolveDTS = parsePackage(packageName, config);
      if (!resolveDTS)
      {
         console.warn(
          `esm-d-ts - resolvePackageExports warning: Could not locate TS declaration for '${packageName}'.`);
         continue;
      }

      const dtsBasename = upath.basename(resolveDTS);

      const dtsFileData = fs.readFileSync(resolveDTS, 'utf-8');
      const outputDir = `${config.outDir}${upath.sep}._node_modules${upath.sep}${packageName}`;
      const outputFilepath = `${outputDir}${upath.sep}${dtsBasename}`;

      fs.ensureDirSync(outputDir);
      fs.writeFileSync(outputFilepath, dtsFileData, 'utf-8');

      packageAlias.push({
         find: packageName,
         replacement: outputFilepath
      });
   }

   return packageAlias;
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
 * Fully parses all file paths provided. Includes top level "re-exported" packages in `packages` data.
 *
 * @param {Iterable<string>} filePaths - List of file paths to parse.
 *
 * @param {Map<string, string>} [importMap] - An optional map of imports from a given package.json
 *
 * @returns {Promise<{files: Set<string>, packages: Set<string>}>} Parsed files and top level packages exported.
 */
async function parseFiles(filePaths, importMap = new Map())
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

         // Must indicate warnings for the case when an `index.js` / `index.mjs` file is referenced by directory.
         const stats = fs.statSync(resolved);
         if (stats.isDirectory())
         {
            if (fs.existsSync(`${resolved}/index.js`) || fs.existsSync(`${resolved}/index.mjs`))
            {
               // Could not resolve index reference so skip file.
               console.warn(
                `esm-d-ts - parse warning: detected bare directory import without expected '/index.(m)js'`);
            }
            else
            {
               console.warn(`esm-d-ts - parse warning: could not resolve directory: ${resolved}`);
            }

            continue;
         }

         if (parsedFiles.has(resolved)) { continue; }

         parsedFiles.add(resolved);

         const dirpath = upath.dirname(resolved);

         if (!fs.existsSync(resolved))
         {
            if (fs.existsSync(`${resolved}.js`)) { resolved = `${resolved}.js`; }
            else if (fs.existsSync(`${resolved}.mjs`)) { resolved = `${resolved}.mjs`; }
            else
            {
               console.warn(`esm-d-ts - parse warning: could not resolve: ${resolved}`);
               continue;
            }
         }

         files.add(resolved);

         const fileData = fs.readFileSync(resolved, 'utf-8').toString();

         const [imports] = parse(fileData);

         for (const data of imports)
         {
            if (data.n === void 0 || data.d === -2) { continue; }

            // Check importMap for paths specified in `package.json` imports.
            if (data.n.startsWith('#') && importMap.has(data.n))
            {
               data.n = importMap.get(data.n);
            }

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

            // Only add packages exported from the top level as part of the public contract. Ignore any packages
            // that don't resolve to local node_modules.
            try
            {
               // TODO: Evaluate if a require check is necessary. This seemed to exclude valid packages.
               // if (topLevel && s_REGEX_EXPORT.exec(substring) && requireMod.resolve(data.n)) { packages.add(data.n); }
               if (topLevel && s_REGEX_EXPORT.exec(substring)) { packages.add(data.n); }
            }
            catch (err) { /* */ }
         }
      }

      if (toParseFiles.size > 0) { parsePaths(toParseFiles); }
   };

   parsePaths(filePaths, true);

   return { files, packages };
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
   const isOrgPackage = packageName.startsWith('@');

   // Split the package name into base and an export path. The last match index is either the package name or export
   // path.
   const match = isOrgPackage ? s_REGEX_PACKAGE_SCOPED.exec(packageName) : s_REGEX_PACKAGE.exec(packageName);

   if (!match) { return void 0; }

   const packagePath = `./${upath.relative('.', requireMod.resolve(`${match[1]}/package.json`))}`;
   const packageDir = `./${upath.relative('.', upath.dirname(packagePath))}`;

   const packageJSON = JSON.parse(fs.readFileSync(packagePath).toString());

   // The export path is the last match. This may be the actual package name which in this case '.' is used to match
   // the default export path.
   const exportPathMatch = match[match.length - 1];

   // Handle parsing package exports.
   if (typeof packageJSON.exports === 'object' && typeof exportPathMatch === 'string')
   {
      // If exportPathMatch is the packageName use '.' instead of the a path lookup.
      const exportPath = exportPathMatch === packageName ? '.' : `.${exportPathMatch}`;

      const exportTypesPath = exports(packageJSON, exportPath, { conditions: ['types'] });

      let resolvePath;

      if (exportTypesPath)
      {
         // Resolve any export path with `resolve.export`.
         // First attempt to resolve most recent Typescript support for `types` in exports.
         resolvePath = upath.join(packageDir, ...exportTypesPath);

         // If a declaration is found and the file exists return now.
         if (resolvePath.endsWith('.d.ts') && fs.existsSync(resolvePath)) { return `./${resolvePath}`; }
      }

      const exportConditionPath = exports(packageJSON, exportPath, config.exportCondition);

      if (exportConditionPath)
      {
         // Now resolve any provided export condition configuration option or default to `imports`.
         resolvePath = upath.join(packageDir, ...exportConditionPath);

         // In the chance case that the user provided export condition matches `types` check again for declaration file
         // before changing the extension and resolving further.
         const resolveDTS = resolvePath.endsWith('.d.ts') ? `./${resolvePath}` :
          `./${upath.changeExt(resolvePath, '.d.ts')}`;

         // Found a TS declaration directly associated with the export then return it.
         if (fs.existsSync(resolveDTS)) { return resolveDTS; }
      }

      // Now attempt to find the nearest `package.json` that isn't the root `package.json`.
      const { packageObj, filepath } = getPackageWithPath({ filepath: resolvePath });

      // A specific subpackage export was specified, but no associated declaration found and the package.json found
      // is the root package, so a specific declaration for the subpackage is not resolved.
      if (upath.relative('.', filepath) === packagePath) { return void 0; }

      // Now check `package.json` `types` as last fallback.
      if (packageObj && typeof packageObj.types === 'string')
      {
         const lastResolveDTS = `./${upath.join(packageDir, packageObj.types)}`;
         if (lastResolveDTS.endsWith('.d.ts') && fs.existsSync(lastResolveDTS)) { return lastResolveDTS; }
      }
   }

   // Now check `package.json` `types` as last fallback.
   if (typeof packageJSON.types === 'string')
   {
      const lastResolveDTS = `./${upath.join(packageDir, packageJSON.types)}`;
      if (lastResolveDTS.endsWith('.d.ts') && fs.existsSync(lastResolveDTS)) { return lastResolveDTS; }
   }

   // TODO: Consider default index.js / index.d.ts locations.

   return void 0;
}

/**
 * Parses the closest package.json to `resolvePath` resolving any imports that directly point to a string / file path.
 *
 * @param {string}   filepath - A file path to resolve closest `package.json`.
 *
 * @returns {Map<string, string>} Import map.
 */
function parsePackageImports(filepath)
{
   /** @type {Map<string, string>} */
   const importMap = new Map();

   // Now attempt to find the nearest `package.json` that isn't the root `package.json`.
   const { packageObj } = getPackageWithPath({ filepath });

   if (packageObj && typeof packageObj.imports === 'object')
   {
      for (const [key, value] of Object.entries(packageObj.imports))
      {
         if (typeof value === 'string')
         {
            const resolvedPath = upath.resolve(value);
            if (fs.existsSync(resolvedPath))
            {
               importMap.set(key, resolvedPath);
            }
         }
      }
   }

   return importMap;
}

const s_DEFAULT_TS_OPTIONS = {
   allowJs: true,
   declaration: true,
   emitDeclarationOnly: true,
   moduleResolution: ts.ModuleResolutionKind.Bundler,
   module: ts.ModuleKind.NodeNext,
   target: ts.ScriptTarget.ES2022,
   outDir: './.dts'
};

/**
 * @typedef {object} GenerateConfig - Data used to generate TS definitions.
 *
 * @property {string}               main - The main entry ESM source path.
 *
 * @property {string}               [output='./types/index.d.ts'] - The bundled output TS definition path.
 *
 * @property {boolean}              [bundlePackageExports=false] - When true attempt to bundle types of top level
 *                                                                 exported packages. This is useful for re-bundling
 *                                                                 libraries.
 *
 * @property {object}               [compilerOptions] - Typescript compiler options.
 *
 * @property {object}               [exportCondition] - `resolve.exports` conditional options.
 *
 * @property {Iterable<string>}     [prependGen] - Generate TS definitions for these files prepending to bundled output.
 *
 * @property {Iterable<string>}     [prependString] - Directly prepend these strings to the bundled output.
 */
