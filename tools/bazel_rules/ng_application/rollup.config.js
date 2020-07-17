import { default as NodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { join, relative, resolve } from 'path';
import { writeFileSync } from 'fs';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import optimizer from '@angular-devkit/build-optimizer/src/build-optimizer/rollup-plugin';
import {} from '@angular-devkit/build-optimizer';
import { terser } from 'rollup-plugin-terser';\ d

const BASE_DIR = process.env.ROLLUP_BASE_DIR;
const OUTPUT_PATH = process.env.ROLLUP_OUTPUT_DIR;
const INPUT_FILE = process.env.ROLLUP_INPUT_FILE;

/** Tracks the outputs on initialization */
let BUNDLE_TRACKER = 0;
/** Counts how many bundles are processed */
let BUNDLES_COUNT = 0;
/** List of already processed bundles */
const BUNDLES = [];

/** Bundle tracker plugin to identify how many bundles have to be processed*/
function tracker() {
  BUNDLE_TRACKER++;
  return { name: 'tracker' };
}

function rollupIndexFileGeneration() {
  return {
    name: 'rollup-index-file-generation',
    generateBundle(options, bundle) {
      BUNDLES_COUNT++;
      const chunk = Object.values(bundle)[0];
      if (chunk.isEntry) {
        BUNDLES.push({
          // legacy es5 will be processed with babel
          legacy:
            options.plugins.findIndex(({ name }) => name === 'babel') > -1,
          dir: options.dir,
          name: chunk.fileName,
        });
      }

      if (BUNDLES_COUNT === BUNDLE_TRACKER) {
        const scripts = BUNDLES.map((chunk) => generateScriptTag(chunk));
        this.emitFile({
          type: 'asset',
          dir: OUTPUT_PATH,
          fileName: 'index.html',
          source: generateIndexHTML(scripts),
        });
      }
    },
  };
}

// TODO: lukas.holzer checkout https://rollupjs.org/guide/en/#outputmanualchunks
// for common chunk (vendor bundle)
export default (args) => {
  return {
    input: INPUT_FILE,
    // https://rollupjs.org/guide/en/#preserveentrysignatures
    // preserveEntrySignatures: false,
    output: [
      // ...generateBundles(false, ['es2015']),
      ...generateBundles(false),
    ],
    plugins: [
      NodeResolve({
        preferBuiltins: true,
        mainFields: [
          'module_ivy_ngcc',
          'main_ivy_ngcc',
          'browser',
          'es2015',
          'module',
          'jsnext:main',
          'main',
        ],
      }),
      commonjs(),
      // use the angular build optimizer
      // optimizer({ sideEffectFreeModules: [] }),
      rollupIndexFileGeneration(),
    ],
  };
};

function generateBundles(minified = true, types = ['es5', 'es2015']) {
  return types.map((type) => {
    const suffix = minified ? '.min' : '';
    const output = {
      chunkFileNames: `[name]-${type}-[hash]${suffix}.js`,
      entryFileNames: `[name]-${type}-[hash]${suffix}.js`,
      dir: OUTPUT_PATH,
      format: 'es',
      plugins: [tracker()],
    };

    if (type === 'es5') {
      output.plugins.push(
        getBabelOutputPlugin({ presets: ['@babel/preset-env'] }),
      );
    }

    if (minified) {
      output.plugins.push(terser());
    }

    return output;
  });
}

function generateIndexHTML(scripts) {
  return (
    `<!DOCTYPE html>` +
    `<html>` +
    `<head>` +
    `<meta charset="UTF-8">` +
    `<title>Title</title>` +
    `<base href="/" />` +
    `<link rel="stylesheet" href="./styles.css" />` +
    `</head>` +
    `<body>` +
    `<dt-e2e-app>Loading Application...</dt-e2e-app>` +
    `<script src="./zone.js/dist/zone.min.js"></script>` +
    scripts.join('') +
    `</body>` +
    `</html>`
  );
}

/**
 * Generates a script tag out of a chunk
 * @param {Object} chunk
 * @param {string} chunk.dir Directory of the chunk
 * @param {string} chunk.name Filename of the chunk
 * @param {boolean} chunk.legacy If the chunk is compiled with es5 or not
 * @returns {string} Returns the generated Script tag
 */
function generateScriptTag(chunk) {
  const relativePath = relative(chunk.dir, OUTPUT_PATH);
  const attributes = [`src="${join(relativePath, chunk.name)}"`];

  if (chunk.legacy) {
    attributes.push('nomodule', 'defer');
  } else {
    attributes.push(`type="module"`);
  }

  return `<script ${attributes.join(' ')}></script>`;
}
