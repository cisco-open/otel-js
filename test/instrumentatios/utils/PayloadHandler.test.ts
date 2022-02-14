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

import { PayloadHandler } from '../../../src/instrumentations/utils/PayloadHandler';
import * as sinon from 'sinon';
import * as api from '@opentelemetry/api';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { Options } from '../../../src';
import * as assert from 'assert';

const provider = new BasicTracerProvider();
const tracer = provider.getTracer('test-http-body-handler');
const memoryExporter = new InMemorySpanExporter();
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

describe('HttpBodyHandler tests', () => {
  const ATTR_PREFIX = 'http.request.body';
  const defaultOptions = <Options>{
    FSOToken: 'some-token',
    FSOEndpoint: 'http://localhost:4317',
    serviceName: 'application',
  };

  let logger;

  beforeEach(() => {
    memoryExporter.reset();
    logger = {
      debug: sinon.spy(),
    };

    api.diag.setLogger(logger, api.DiagLogLevel.ALL);
    // Setting logger logs stuff. Cleaning that up.
    logger.debug.resetHistory();
  });

  it('should capture data and set relevant span attr - single chunk', done => {
    const span = tracer.startSpan('HTTP GET - TEST');
    const testBody = JSON.stringify({ sup: 'this is da chunk' });

    const bodyHandler = new PayloadHandler(defaultOptions, 'someEncoding');
    bodyHandler.addChunk(Buffer.from(testBody));
    bodyHandler.setPayload(span, ATTR_PREFIX);
    span.end();

    const spans = memoryExporter.getFinishedSpans();

    assert.equal(spans.length, 1);
    assert.equal(spans[0].attributes[ATTR_PREFIX], testBody);
    sinon.assert.neverCalledWith(logger.debug);
    done();
  });

  it('should do nothing when chunk is undefined', done => {
    const span = tracer.startSpan('HTTP GET - TEST');

    const bodyHandler = new PayloadHandler(defaultOptions, 'someEncoding');
    bodyHandler.addChunk(undefined);
    bodyHandler.setPayload(span, ATTR_PREFIX);
    span.end();

    const spans = memoryExporter.getFinishedSpans();

    assert.equal(spans.length, 1);
    assert(!spans[0].attributes[ATTR_PREFIX]);
    sinon.assert.neverCalledWith(logger.debug);
    done();
  });

  it('should capture data and set relevant span attr - multiple chunks', done => {
    const span = tracer.startSpan('HTTP GET - TEST');
    const testBody = JSON.stringify({ sup: 'this is da chunk' });

    const bodyHandler = new PayloadHandler(defaultOptions, 'someEncoding');
    const bodyBuffer = Buffer.from(testBody);
    bodyHandler.addChunk(bodyBuffer.slice(0, 4));
    bodyHandler.addChunk(bodyBuffer.slice(4, bodyBuffer.length));
    bodyHandler.setPayload(span, ATTR_PREFIX);
    span.end();

    const spans = memoryExporter.getFinishedSpans();

    assert.equal(spans.length, 1);
    assert.equal(spans[0].attributes[ATTR_PREFIX], testBody);
    sinon.assert.neverCalledWith(logger.debug);
    done();
  });

  it('should capture data and set relevant span attr - not JSON data', done => {
    const span = tracer.startSpan('HTTP GET - TEST');
    const testBody = 'This is definitely noy a json';

    const bodyHandler = new PayloadHandler(defaultOptions, 'someEncoding');
    const bodyBuffer = Buffer.from(testBody);
    bodyHandler.addChunk(bodyBuffer);
    bodyHandler.setPayload(span, ATTR_PREFIX);
    span.end();

    const spans = memoryExporter.getFinishedSpans();

    assert.equal(spans.length, 1);
    assert.equal(spans[0].attributes[ATTR_PREFIX], testBody);
    sinon.assert.neverCalledWith(logger.debug);
    done();
  });

  it('should capture data and set relevant span attr - utf-16', done => {
    const span = tracer.startSpan('HTTP GET - TEST');
    const testBody = 'זה לא ג׳ייסון';

    const bodyHandler = new PayloadHandler(defaultOptions, 'someEncoding');
    const bodyBuffer = Buffer.from(testBody);
    bodyHandler.addChunk(bodyBuffer);
    bodyHandler.setPayload(span, ATTR_PREFIX);
    span.end();

    const spans = memoryExporter.getFinishedSpans();

    assert.equal(spans.length, 1);
    assert.equal(spans[0].attributes[ATTR_PREFIX], testBody);
    sinon.assert.neverCalledWith(logger.debug);
    done();
  });

  it('should capture data and set relevant span attr < maxPayloadSize', done => {
    const options = <Options>{
      FSOToken: 'some-token',
      FSOEndpoint: 'http://localhost:4317',
      serviceName: 'application',
      maxPayloadSize: 10,
    };
    const span = tracer.startSpan('HTTP GET - TEST');
    const testBody = 'too long bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy';

    const bodyHandler = new PayloadHandler(options, 'someEncoding');
    const bodyBuffer = Buffer.from(testBody);
    bodyHandler.addChunk(bodyBuffer);
    bodyHandler.setPayload(span, ATTR_PREFIX);
    span.end();

    const spans = memoryExporter.getFinishedSpans();

    assert.equal(spans.length, 1);
    assert.equal(
      spans[0].attributes[ATTR_PREFIX],
      testBody.slice(0, options.maxPayloadSize)
    );
    sinon.assert.neverCalledWith(logger.debug);
    done();
  });
});
