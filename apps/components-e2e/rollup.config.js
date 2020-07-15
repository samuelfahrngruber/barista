import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default (args) => {
  return {
    plugins: [
      resolve({
        preferBuiltins: true,
        mainFields: ['browser', 'es2015', 'module', 'jsnext:main', 'main'],
      }),
      commonjs(),
    ],
  };
};
