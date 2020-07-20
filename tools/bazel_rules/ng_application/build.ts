/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import nodeResolve from '@rollup/plugin-node-resolve';
const commonjs = require('@rollup/plugin-commonjs');
import { rollup, OutputOptions } from 'rollup';
import { resolve } from 'path';

export async function build(inputFile: string) {
  const bundle = await rollup({
    input: resolve(inputFile),
    plugins: [
      nodeResolve({
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
    ],
  });

  const outputDir = resolve('output-es2015');
  console.log(outputDir);

  const outputOptions: OutputOptions = {
    chunkFileNames: `[name]-es2015-[hash].js`,
    entryFileNames: `[name]-es2015-[hash].js`,
    dir: outputDir,
    format: 'es',
  };
  await bundle.generate(outputOptions);
  await bundle.write(outputOptions);

  // console.log(output)
}
