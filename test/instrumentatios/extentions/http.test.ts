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

import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { configureHttpInstrumentation } from '../../../src/instrumentations/extentions/http';
import { Options } from '../../../src';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

const instrumentation = new HttpInstrumentation();
instrumentation.enable();
import * as http from 'http'
import * as utils from '../../utils';
import * as assert from "assert";

const memoryExporter = new InMemorySpanExporter();
const provider = new BasicTracerProvider();
instrumentation.setTracerProvider(provider);
const tracer = provider.getTracer('test-https');
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

describe('Capturing HTTP Headers/Bodies', () => {
  const options = <Options>{
    FSOToken: 'some-token',
    FSOEndpoint: 'http://localhost:4713',
    serviceName: 'application',
  };

  const express = require('express');
  const bodyParser = require('body-parser');

  const app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get('/test', (req: any, res: any) => {
    res.send({ status: 'success' });
  });
  app.post('/test_post', (req: any, res: any) => {
    res.send({ status: 'post_success' });
  });

  app.post('/test_post_end', (req: any, res: any) => {
    const body = JSON.stringify(req.body);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(body);
  });

  app.get('/circular-test', (req: any, res: any) => {
    http
      .request({ host: 'localhost', port: 8000, path: '/test' }, res2 => {
        let str = '';

        res2.on('data', chunk => {
          str += chunk;
        });

        res2.on('end', () => {
          console.log(str);
          res.setHeader('Content-Type', 'application/json');
          res.send(str);
        });
      })
      .end();
  });

  const server = http.createServer(app);

  before(done => {
    server.listen(8000);
    server.on('listening', () => {
      done();
    });
    instrumentation.enable();
  });

  beforeEach(() => {
    memoryExporter.reset();
    configureHttpInstrumentation(instrumentation, options);
    utils.cleanEnvironmentVariables();
  });

  afterEach(() => {
    server.close();
  });

  it('test capture request headers - post', async () => {
    const span = tracer.startSpan('updateRootSpan');
    let request_headers = {
          'content-type': 'application/json',
          'extra-spam-header': 'span-value'
    };

    await utils.httpRequest.post(
      {
        host: 'localhost',
        port: 8000,
        path: '/test_post',
        headers: request_headers
      },

      JSON.stringify({ test: 'req data' })
    );
    span.end();

    const spans = memoryExporter.getFinishedSpans();

    assert.equal(spans.length, 3)
    const httpClientSpan = spans[1];

    for (const headerKey in request_headers) {
      const headerValue = request_headers[headerKey];
      assert.equal(httpClientSpan.attributes[`http.request.header.${headerKey.toLocaleLowerCase()}`], headerValue)
    }
    console.log(httpClientSpan)
  });
});
