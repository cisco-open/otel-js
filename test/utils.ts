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
import * as http from 'http';
import * as assert from 'assert';

import { ReadableSpan } from '@opentelemetry/sdk-trace-base';

export const cleanEnvironmentVariables = () => {
  Object.keys(process.env).forEach(key => {
    delete process.env[key];
  });
};

export function assertExpectedObj(
  span: ReadableSpan,
  obj: Object,
  attrPrefix: string
) {
  for (const key in obj) {
    const value = obj[key];
    assert.strictEqual(
      span.attributes[`${attrPrefix}.${key.toLocaleLowerCase()}`],
      value
    );
  }
}

export const httpRequest = {
  get: (options: http.ClientRequestArgs | string) => {
    return new Promise((resolve, reject) => {
      return http.get(options, resp => {
        let data = '';
        resp.on('data', chunk => {
          data += chunk;
        });
        resp.on('end', () => {
          resolve(data);
        });
        resp.on('error', err => {
          reject(err);
        });
      });
    });
  },
  post: (options: http.ClientRequestArgs, body?: unknown) => {
    options.method = 'POST';
    return new Promise((resolve, reject) => {
      const req = http.request(options, resp => {
        let data = '';
        resp.on('data', chunk => {
          data += chunk;
        });
        resp.on('end', () => {
          resolve(data);
        });
        resp.on('error', err => {
          reject(err);
        });
      });
      if (body) {
        req.write(body);
      }
      req.end();
      return req;
    });
  },
};
