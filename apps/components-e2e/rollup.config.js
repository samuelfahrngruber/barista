import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';

export default (args) => {
  return {
    // https://rollupjs.org/guide/en/#preserveentrysignatures
    preserveEntrySignatures: false,
    plugins: [
      resolve({
        preferBuiltins: true,
        mainFields: ['browser', 'es2015', 'module', 'jsnext:main', 'main'],
      }),
      commonjs(),
    ],
    output: [
      {
        format: 'esm',
        dir: 'es2015',
      },
      {
        dir: 'es5',
        format: 'esm',
        plugins: [getBabelOutputPlugin({ presets: ['@babel/preset-env'] })],
      },
    ],
  };
};
