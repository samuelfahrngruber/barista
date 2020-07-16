import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { join } from 'path';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import optimizer from '@angular-devkit/build-optimizer/src/build-optimizer/rollup-plugin';
import {} from '@angular-devkit/build-optimizer';
import { terser } from 'rollup-plugin-terser';
import html from '@open-wc/rollup-plugin-html';

const BASE_DIR = process.env.ROLLUP_BASE_DIR;
const OUTPUT_PATH = process.env.ROLLUP_OUTPUT_DIR;
const INPUT_FILE = process.env.ROLLUP_INPUT_FILE;

// const htmlPlugin = html({
//   name: 'index.html',
//   inject: false,
//   outputBundleName: 'modern',
//   dir: OUTPUT_PATH,
//   rootDir: OUTPUT_PATH,
//   template({ bundles }) {
//     console.log(bundles)
//     return `<html></html>`;
//   },
// });

// TODO: lukas.holzer checkout https://rollupjs.org/guide/en/#outputmanualchunks
// for common chunk (vendor bundle)
export default (args) => {
  return {
    input: INPUT_FILE,
    // https://rollupjs.org/guide/en/#preserveentrysignatures
    preserveEntrySignatures: false,
    output: [...generateBundles(false), ...generateBundles(true)],
    plugins: [
      resolve({
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
      // htmlPlugin,
    ],
  };
};

function generateBundles(minified = true, types = ['es5', 'es2015']) {
  return types.map((type) => {
    const suffix = minified ? '.min' : '';
    const outputType = type === 'es2015' ? 'modern' : 'legacy';
    const output = {
      chunkFileNames: `[name]-${type}${suffix}.js`, // -[hash]
      entryFileNames: `[name]-${type}${suffix}.js`, // -[hash]
      dir: join(OUTPUT_PATH, type),
      // dir: OUTPUT_PATH,
      format: 'es',
      // plugins: [htmlPlugin.addOutput(outputType)],
      plugins: [],
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
