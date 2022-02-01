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
import * as utils from '../../utils';

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
instrumentation.disable();

const memoryExporter = new InMemorySpanExporter();
const provider = new BasicTracerProvider();
instrumentation.setTracerProvider(provider);
const tracer = provider.getTracer('test-https');
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

const PORT = 11337;
const SERVER_URL = `http://localhost:${PORT}`;

describe('Capturing HTTP Headers/Bodies', () => {
  let http;
  let server;
  const options = <Options>{
    FSOToken: 'some-token',
    FSOEndpoint: 'http://localhost:4713',
    serviceName: 'application',
  };

  before(() => {
    instrumentation.enable();
  });

  before(() => {
    instrumentation.disable();
  });

  beforeEach(() => {
    memoryExporter.reset();
    configureHttpInstrumentation(instrumentation, options);
    utils.cleanEnvironmentVariables();
  });

  afterEach(() => {
    server.close();
  });

  const setupServer = () => {
    http = require('http');
    server = http.createServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Response-header': 'some response'
      });
      res.end(JSON.stringify({
        data: 'Hello World!'
      }));

    });
    server.listen(PORT);
    console.log('Server is up');
  };

  it('test sanity - unstable', done => {
    setupServer();

    const requestOptions = {
      content: JSON.stringify({ impuestos: [1, 2] }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Test-Header': 'Some Header',
      },
    };

    const span = tracer.startSpan('updateRootSpan');
    http.get(SERVER_URL, requestOptions, res => {
      res.on('data', (data) => {
        console.log('my dataaa bruhh: ' + data)
      })
      res.end()
      span.end();
      memoryExporter.getFinishedSpans();
      done();
    });
  });
});
