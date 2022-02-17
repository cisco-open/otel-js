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
import { _configDefaultOptions } from '../../../src/options';

const provider = new BasicTracerProvider();
const tracer = provider.getTracer('test-payload-handler');
const memoryExporter = new InMemorySpanExporter();
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

describe('PayloadHandler tests', () => {
  const ATTR_PREFIX = 'http.request.body';
  const options = {
    ciscoToken: 'some-token',
    collectorEndpoint: 'grpc://localhost:4317',
    serviceName: 'application',
  };

  const defaultOptions = <Options>_configDefaultOptions(options);

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

  describe('PayloadHandler instance tests', () => {
    it('should capture data and set relevant span attr - single chunk', done => {
      const span = tracer.startSpan('HTTP GET - TEST');
      const testBody = JSON.stringify({ sup: 'this is da chunk' });

      const payloadHandler = new PayloadHandler(defaultOptions, 'someEncoding');
      payloadHandler.addChunk(Buffer.from(testBody));
      payloadHandler.setPayload(span, ATTR_PREFIX);
      span.end();

      const spans = memoryExporter.getFinishedSpans();

      assert.equal(spans.length, 1);
      assert.equal(spans[0].attributes[ATTR_PREFIX], testBody);
      sinon.assert.neverCalledWith(logger.debug);
      done();
    });

    it('should do nothing when chunk is undefined', done => {
      const span = tracer.startSpan('HTTP GET - TEST');

      const payloadHandler = new PayloadHandler(defaultOptions, 'someEncoding');
      payloadHandler.addChunk(undefined);
      payloadHandler.setPayload(span, ATTR_PREFIX);
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

      const payloadHandler = new PayloadHandler(defaultOptions, 'someEncoding');
      const payloadBuffer = Buffer.from(testBody);
      payloadHandler.addChunk(payloadBuffer.slice(0, 4));
      payloadHandler.addChunk(payloadBuffer.slice(4, payloadBuffer.length));
      payloadHandler.setPayload(span, ATTR_PREFIX);
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

      const payloadHandler = new PayloadHandler(defaultOptions, 'someEncoding');
      const payloadBuffer = Buffer.from(testBody);
      payloadHandler.addChunk(payloadBuffer);
      payloadHandler.setPayload(span, ATTR_PREFIX);
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

      const payloadHandler = new PayloadHandler(defaultOptions, 'someEncoding');
      const payloadBuffer = Buffer.from(testBody);
      payloadHandler.addChunk(payloadBuffer);
      payloadHandler.setPayload(span, ATTR_PREFIX);
      span.end();

      const spans = memoryExporter.getFinishedSpans();

      assert.equal(spans.length, 1);
      assert.equal(spans[0].attributes[ATTR_PREFIX], testBody);
      sinon.assert.neverCalledWith(logger.debug);
      done();
    });

    it('should capture data and set relevant span attr < maxPayloadSize', done => {
      const userOptions = {
        ciscoToken: 'some-token',
        collectorEndpoint: 'http://localhost:4317',
        serviceName: 'application',
        maxPayloadSize: 10,
      };

      const options = <Options>_configDefaultOptions(userOptions);
      const span = tracer.startSpan('HTTP GET - TEST');
      const testBody = 'too long payloadyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy';

      const payloadHandler = new PayloadHandler(options, 'someEncoding');
      const payloadBuffer = Buffer.from(testBody);
      payloadHandler.addChunk(payloadBuffer);
      payloadHandler.setPayload(span, ATTR_PREFIX);
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
  describe('PayloadHandler classmethod tests', () => {
    it('should capture data and set relevant span attr', done => {
      const span = tracer.startSpan('TEST');
      const testBody = 'too long payloadyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy';
      const maxPayloadSize = 10000;

      const payloadBuffer = Buffer.from(testBody);
      PayloadHandler.setPayload(
        span,
        ATTR_PREFIX,
        payloadBuffer,
        maxPayloadSize
      );
      span.end();

      const spans = memoryExporter.getFinishedSpans();

      assert.equal(spans.length, 1);
      assert.equal(
        spans[0].attributes[ATTR_PREFIX],
        testBody.slice(0, maxPayloadSize)
      );
      sinon.assert.neverCalledWith(logger.debug);
      done();
    });

    it('should capture data and set relevant span attr < maxPayloadSize', done => {
      const span = tracer.startSpan('TEST');
      const testBody = 'too long payloadyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy';
      const maxPayloadSize = 10;

      const payloadBuffer = Buffer.from(testBody);
      PayloadHandler.setPayload(
        span,
        ATTR_PREFIX,
        payloadBuffer,
        maxPayloadSize
      );
      span.end();

      const spans = memoryExporter.getFinishedSpans();

      assert.equal(spans.length, 1);
      assert.equal(
        spans[0].attributes[ATTR_PREFIX],
        testBody.slice(0, maxPayloadSize)
      );
      sinon.assert.neverCalledWith(logger.debug);
      done();
    });
  });
});
