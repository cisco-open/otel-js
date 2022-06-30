/*
 * Copyright The OpenTelemetry Authors
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

import * as assert from 'assert';
import * as sinon from 'sinon';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { diag } from '@opentelemetry/api';
import { ciscoTracing, Options } from '../src';
import * as utils from './utils';
import { Consts } from 'cisco-opentelemetry-specifications';

describe('Tracing test', () => {
  let addSpanProcessorMock: any;
  const createLoggerStub = sinon.fake();

  beforeEach(() => {
    addSpanProcessorMock = sinon.stub(
      NodeTracerProvider.prototype,
      'addSpanProcessor'
    );
    diag.setLogger = createLoggerStub;

    utils.cleanEnvironmentVariables();
  });

  afterEach(() => {
    addSpanProcessorMock.restore();
    createLoggerStub.resetHistory();
  });

  function assertTracingPipeline(
    exportURL: string,
    serviceName: string,
    accessToken?: string
  ) {
    sinon.assert.calledOnce(addSpanProcessorMock);
    const processor = addSpanProcessorMock.getCall(0).args[0];

    assert(processor instanceof BatchSpanProcessor);
    const exporter = processor['_exporter'];
    assert(exporter instanceof OTLPHttpTraceExporter);

    assert.deepEqual(exporter.url, exportURL);

    if (accessToken) {
      // gRPC not yet supported in ingest
      assert.equal(
        // eslint-disable-next-line no-prototype-builtins
        exporter?.headers?.[Consts.TOKEN_HEADER_KEY],
        `Bearer ${accessToken}`
      );
    }
  }

  it('setups tracing with custom options', async () => {
    const userOptions: Partial<Options> = {
      serviceName: 'my-app-name',
      ciscoToken: 'cisco-token',
      debug: false,
    };
    await ciscoTracing.init(userOptions);
    assertTracingPipeline(
      Consts.DEFAULT_COLLECTOR_ENDPOINT,
      'my-app-name',
      'cisco-token'
    );
  });

  it('setups tracing with defaults', async () => {
    const userOptions = {
      serviceName: '',
      ciscoToken: 'someToken',
    };
    await ciscoTracing.init(userOptions);
    sinon.assert.calledOnce(addSpanProcessorMock);
  });
});
