/*
 * Copyright The Cisco Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const copy = require('rollup-plugin-copy');
const eslint = require('@rollup/plugin-eslint');
const { terser } = require('rollup-plugin-terser');

module.exports = {
  input: 'build/src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  plugins: [
    process.env.NODE_ENV === 'production'
      ? eslint({
          throwOnError: true,
          throwOnWarning: true,
        })
      : null,
    commonjs(),
    json(),
    process.env.NODE_ENV === 'production'
      ? terser({
          warnings: 'verbose',
          compress: {
            warnings: 'verbose',
          },
          mangle: {
            keep_fnames: true,
          },
          output: {
            beautify: false,
          },
        })
      : null,
    copy({
      targets: [
        {
          src: 'build/src/index.d.ts',
          dest: 'dist',
          rename: 'bundle.d.ts',
        },
      ],
    }),
  ],
};
