const { argv } = require('yargs');
const { resolve, dirname, join, extname, relative } = require('path');
const { URL, pathToFileURL, fileURLToPath } = require('url');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const whatwgUrl = require( 'whatwg-url');
const { toBrowserPath,generateModuleMappings, resolveModulePath } = require('../utils');

const nodeResolvePackageJson = require('@rollup/plugin-node-resolve/package.json');

const fakePluginContext = {
  meta: {
    rollupVersion: nodeResolvePackageJson.peerDependencies.rollup,
  },
  warn(...msg) {
    console.warn('[es-dev-server] node-resolve: ', ...msg);
  },
};


const { port, index, mappings } = argv;
const indexHTML = relative(process.cwd(), resolve(index));

const fileExtensions = ['.mjs', '.js'];
const realtiveRootDir = dirname(index);
const absoluteRootDir = resolve(realtiveRootDir);
const modulesFile = join(absoluteRootDir, mappings);
const moduleMappings = generateModuleMappings(modulesFile);

const resolver = nodeResolve({
  rootDir: absoluteRootDir,
  // allow resolving polyfills for nodejs libs
  preferBuiltins: true,
  jsnext: true,
  browser: true,
  // will overwrite es-dev-server's fileExtensions option
  extensions: fileExtensions,
  // will overwrite es-dev-server's dedupe option
  dedupe: ['lit-html'],
  customResolveOptions: {
    // will overwrite es-dev-server's moduleDirs option
    moduleDirectory: [join(process.cwd(), 'external/npm/node_modules')],
    preserveSymlinks: true,
  },
})

module.exports = {
  port: port || 4200,
  watch: true,
  rootDir: process.cwd(),
  middlewares: [
    // redirect to index.html in folder
    function rewriteIndex(context, next) {
      if (context.url === '/' || context.url === '/index.html') {
        context.url = indexHTML;
      }
      return next();
    },
  ],
  plugins: [
    {
      transform(context) {
        if (context.path === indexHTML) {
          const transformedBody = context.body.replace(/<\/body>/, `

    <script src="apps/components-e2e/src/main.mjs" type="module"></script>
</body>
          `);
          return { body: transformedBody };
        }
      },
    },
    {
      async resolveImport({ source, context }) {
        if (whatwgUrl.parseURL(source) != null) {
          // don't resolve urls
          return source;
        }
        const [withoutHash, hash] = source.split('#');
        const [importPath, params] = withoutHash.split('?');

        const relativeImport = importPath.startsWith('.') || importPath.startsWith('/');
        const jsFileImport = fileExtensions.includes(extname(importPath));
        // for performance, don't resolve relative imports of js files. we only do this for js files,
        // because an import like ./foo/bar.css might actually need to resolve to ./foo/bar.css.js
        if (relativeImport && jsFileImport) {
          return source;
        }

        if (source.includes('@dynatrace')) {
          const resolved = resolveModulePath(source, moduleMappings, '.mjs');
          return toBrowserPath(`/${relative(process.cwd(), resolved)}`);
          // console.log(resolved, relative(process.cwd(), resolved));
          // if undefined it might be a published @dynatrace import that has to be resolved
          // via the node_modules with the `sync` operation later on
          if (resolved) {
            return resolved;
          }
        }

        const requestedFile = context.path.endsWith('/') ? `${context.path}index.html` : context.path;
        const fileUrl = new URL(`.${requestedFile}`, `${pathToFileURL(process.cwd())}/`);
        const filePath = fileURLToPath(fileUrl);

        // do the actual resolve using the rolluo plugin
        const result = await resolver.resolveId.call(
          fakePluginContext,
          importPath,
          filePath,
        );

        let resolvedImportFilePath;

        if (result) {
          if (typeof result === 'string') {
            resolvedImportFilePath = result;
          } else if (typeof result.id === 'string') {
            resolvedImportFilePath = result.id;
          }
        }

        if (!resolvedImportFilePath) {
          throw new Error(
            `Could not resolve import "${importPath}" in "${relative(
              process.cwd(),
              filePath,
            )}".`,
          );
        }

        const resolveRelativeTo = extname(filePath) ? dirname(filePath) : filePath;
        const relativeImportFilePath = relative(resolveRelativeTo, resolvedImportFilePath);
        const suffix = `${params ? `?${params}` : ''}${hash ? `#${hash}` : ''}`;
        const resolvedImportPath = `${toBrowserPath(relativeImportFilePath)}${suffix}`;

        return resolvedImportPath.startsWith('/') || resolvedImportPath.startsWith('.')
          ? resolvedImportPath
          : `./${resolvedImportPath}`;

      },
    },
  ],
};
