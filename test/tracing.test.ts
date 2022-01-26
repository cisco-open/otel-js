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

import * as assert from 'assert';
import * as sinon from 'sinon';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { diag } from '@opentelemetry/api';
import { fso, Options } from '../src';

describe('Tracing test', () => {
  let addSpanProcessorMock;
  const createLoggerStub = sinon.fake();

  beforeEach(() => {
    addSpanProcessorMock = sinon.stub(
      NodeTracerProvider.prototype,
      'addSpanProcessor'
    );
    diag.setLogger = createLoggerStub;
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
    assert(exporter instanceof OTLPTraceExporter);

    assert.deepEqual(exporter.url, exportURL);

    if (accessToken) {
      // gRPC not yet supported in ingest
      assert.equal(exporter?.metadata?.get('X-FSO-Token'), accessToken);
    }
  }

  it('setups tracing with custom options', () => {
    const userOptions: Options = {
      FSOEndpoint: 'http://localhost:4317',
      serviceName: 'my-app-name',
      FSOToken: 'fso-token',
      debug: false
    };
    fso.init(userOptions);
    assertTracingPipeline('localhost:4317', 'my-app-name', 'fso-token');
  });

  it('setups tracing with defaults', () => {
    const userOptions: Options = {
      FSOEndpoint: '',
      serviceName: '',
      FSOToken: '',
      debug: false
    };
    process.env.FSO_ENDPOINT = userOptions.FSOEndpoint;
    process.env.SERVICE_NAME = userOptions.serviceName;
    process.env.FSO_TOKEN = userOptions.FSOToken;

    fso.init(userOptions);
    sinon.assert.notCalled(addSpanProcessorMock);
  });
});
