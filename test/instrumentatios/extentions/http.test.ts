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
  ReadableSpan,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

const instrumentation = new HttpInstrumentation();
instrumentation.enable();
import * as http from 'http';
import * as utils from '../../utils';
import * as assert from 'assert';
const memoryExporter = new InMemorySpanExporter();
const provider = new BasicTracerProvider();
instrumentation.setTracerProvider(provider);
const tracer = provider.getTracer('test-https');
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

describe('Capturing HTTP Headers/Bodies', () => {
  function assertExpectedHeaders(
    span: ReadableSpan,
    headers: any,
    command: string
  ) {
    for (const headerKey in headers) {
      const headerValue = headers[headerKey];
      assert.equal(
        span.attributes[
          `http.${command}.header.${headerKey.toLocaleLowerCase()}`
        ],
        headerValue
      );
    }
  }

  const options = <Options>{
    FSOToken: 'some-token',
    FSOEndpoint: 'http://localhost:4713',
    serviceName: 'application',
  };

  const REQUEST_HEADERS = {
    'content-type': 'application/json',
    'extra-spam-header-request': 'spam-value from the request',
  };

  const EXTRA_RESPONSE_HEADERS = {
    'extra-spam-header-response': 'spam-value from the response',
    'and-another-one': 'bites to dust',
  };

  const SUCCESS_GET_MESSAGE = JSON.stringify({ status: 'get_success' });
  const SUCCESS_POST_MESSAGE = JSON.stringify({ status: 'post_success' });

  const express = require('express');
  const bodyParser = require('body-parser');

  const app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get('/test_get', (req: any, res: any) => {
    res.set(EXTRA_RESPONSE_HEADERS);
    res.send(SUCCESS_GET_MESSAGE);
  });
  app.post('/test_post', (req: any, res: any) => {
    res.set(EXTRA_RESPONSE_HEADERS);
    res.send(SUCCESS_POST_MESSAGE);
  });

  app.post('/test_post_end', (req: any, res: any) => {
    res.set(EXTRA_RESPONSE_HEADERS);
    const body = JSON.stringify(req.body);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(body);
  });

  app.get('/circular_test', (req: any, res: any) => {
    http
      .request({ host: 'localhost', port: 8000, path: '/test_get' }, res2 => {
        let str = '';

        res2.on('data', chunk => {
          str += chunk;
        });

        res2.on('end', () => {
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

  after(() => {
    server.close();
  });

  describe('when user configuration specified', () => {
    afterEach(() => {
      instrumentation.setConfig({});
      configureHttpInstrumentation(instrumentation, options);
    });

    it('should see user request hook tags', async () => {
      instrumentation.setConfig({
        requestHook: (span, request) => {
          span.setAttribute('user.attribute', 'dont change me');
          span.setAttribute(
            'http.request.header.missed-header',
            'header-u-missed'
          );
        },
      });
      configureHttpInstrumentation(instrumentation, options);

      const span = tracer.startSpan('updateRootSpan');
      await utils.httpRequest.get({
        host: 'localhost',
        port: 8000,
        path: '/test_get',
        headers: REQUEST_HEADERS,
      });
      span.end();
      const spans = memoryExporter.getFinishedSpans();
      assert.equal(spans.length, 3);
      // make sure our request hook still triggered
      assertExpectedHeaders(spans[1], REQUEST_HEADERS, 'request');
      assertExpectedHeaders(spans[1], EXTRA_RESPONSE_HEADERS, 'response');

      assert.equal(spans[1].attributes['user.attribute'], 'dont change me');
      assert.equal(
        spans[1].attributes['http.request.header.missed-header'],
        'header-u-missed'
      );
    });

    it('should see user response hook tags', async () => {
      instrumentation.setConfig({
        responseHook: (span, request) => {
          span.setAttribute('user.attribute', 'dont change me');
          span.setAttribute(
            'http.response.header.missed-header',
            'header-u-missed'
          );
        },
      });
      configureHttpInstrumentation(instrumentation, options);

      await utils.httpRequest.get({
        host: 'localhost',
        port: 8000,
        path: '/test_get',
        headers: REQUEST_HEADERS,
      });
      const spans = memoryExporter.getFinishedSpans();
      assert.equal(spans.length, 2);

      // make sure our response hook still triggered
      assertExpectedHeaders(spans[1], REQUEST_HEADERS, 'request');
      assertExpectedHeaders(spans[1], EXTRA_RESPONSE_HEADERS, 'response');

      assert.equal(spans[1].attributes['user.attribute'], 'dont change me');
      assert.equal(
        spans[1].attributes['http.response.header.missed-header'],
        'header-u-missed'
      );
    });
  });

  describe('test capture extra data - POST requests', () => {
    const POST_REQUEST_DATA = JSON.stringify({ test: 'req data' });
    it('test capture request/response - sanity', async () => {
      await utils.httpRequest.post(
        {
          host: 'localhost',
          port: 8000,
          path: '/test_post',
          headers: REQUEST_HEADERS,
        },
        POST_REQUEST_DATA
      );
      const spans = memoryExporter.getFinishedSpans();
      assert.equal(spans.length, 2);
      assertExpectedHeaders(spans[1], REQUEST_HEADERS, 'request');
      assertExpectedHeaders(spans[1], EXTRA_RESPONSE_HEADERS, 'response');
      assert.equal(spans[0].attributes['http.request.body'], POST_REQUEST_DATA);
      assert.equal(
        spans[1].attributes['http.response.body'],
        SUCCESS_POST_MESSAGE
      );
    });

    it('test capture request/response - non existing endpoint', async () => {
      await utils.httpRequest.post(
        {
          host: 'localhost',
          port: 8000,
          path: '/non_existing_endpoint',
          headers: REQUEST_HEADERS,
        },
        POST_REQUEST_DATA
      );
      const spans = memoryExporter.getFinishedSpans();
      assert.equal(spans.length, 2);
      assertExpectedHeaders(spans[1], REQUEST_HEADERS, 'request');
      assert.equal(spans[0].attributes['http.request.body'], POST_REQUEST_DATA);
    });

    it('test post when the response in the end', async () => {
      await utils.httpRequest.post(
        {
          host: 'localhost',
          port: 8000,
          path: '/test_post_end',
          headers: REQUEST_HEADERS,
        },
        POST_REQUEST_DATA
      );

      const spans = memoryExporter.getFinishedSpans();
      assert.equal(spans.length, 2);
      assertExpectedHeaders(spans[1], REQUEST_HEADERS, 'request');
      assert.equal(spans[0].attributes['http.request.body'], POST_REQUEST_DATA);
      // this is an echo endpoint
      assert.equal(
        spans[1].attributes['http.response.body'],
        POST_REQUEST_DATA
      );
    });
  });

  describe('test capture extra data - get requests', () => {
    it('test capture request headers - sanity', async () => {
      await utils.httpRequest.get({
        host: 'localhost',
        port: 8000,
        path: '/test_get',
        headers: REQUEST_HEADERS,
      });
      const spans = memoryExporter.getFinishedSpans();
      assert.equal(spans.length, 2);

      assertExpectedHeaders(spans[1], REQUEST_HEADERS, 'request');
      assertExpectedHeaders(spans[1], EXTRA_RESPONSE_HEADERS, 'response');
      assert.equal(
        spans[1].attributes['http.response.body'],
        SUCCESS_GET_MESSAGE
      );
    });

    it('test capture request headers - non existing endpoint', async () => {
      await utils.httpRequest.get({
        host: 'localhost',
        port: 8000,
        path: '/non_existing_endpoint',
        headers: REQUEST_HEADERS,
      });
      const spans = memoryExporter.getFinishedSpans();
      assert.equal(spans.length, 2);
      assertExpectedHeaders(spans[1], REQUEST_HEADERS, 'request');
    });

    it('test circular request', async () => {
      await utils.httpRequest.get({
        host: 'localhost',
        port: 8000,
        path: '/circular_test',
        headers: REQUEST_HEADERS,
      });
      const spans = memoryExporter.getFinishedSpans();
      assert.equal(spans.length, 4);
      assertExpectedHeaders(spans[1], EXTRA_RESPONSE_HEADERS, 'response');
      assert.equal(
        spans[1].attributes['http.response.body'],
        SUCCESS_GET_MESSAGE
      );
      assertExpectedHeaders(spans[2], REQUEST_HEADERS, 'request');
      assert.equal(spans[2].attributes['http.request.body'], '');
      assertExpectedHeaders(spans[3], REQUEST_HEADERS, 'request');
      assert.equal(
        spans[3].attributes['http.response.body'],
        SUCCESS_GET_MESSAGE
      );
    });
  });
});
