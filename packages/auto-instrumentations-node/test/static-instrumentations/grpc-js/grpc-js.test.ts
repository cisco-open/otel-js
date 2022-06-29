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
/*eslint sort-imports: ["error", { "ignoreDeclarationSort": true }]*/
import { GrpcJsInstrumentation } from '../../../src/instrumentations/static-instrumentations/grpc-js/instrumentation';
import { SemanticAttributes as CiscoSemanticAttributes } from 'cisco-opentelemetry-specifications';
const instrumentation = new GrpcJsInstrumentation('grpc-test-instrumentation', {
  maxPayloadSize: 10,
});
instrumentation.enable();
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import * as utils from '../../../../cisco-sdk-node/test/utils';
import * as grpc from '@grpc/grpc-js';
import { server } from './server';
import { HelloRequest } from './generated_proto/hello_pb';
import { GreeterClient } from './generated_proto/hello_grpc_pb';
import { assertExpectedObj } from '../../../../cisco-sdk-node/test/utils';
import {
  REQUEST_MESSAGE,
  REQUEST_METADATA,
  RESPONSE_MESSAGE,
  RESPONSE_METADATA,
} from './consts';
import assert = require('assert');
import { setInnerOptions } from '../../../../cisco-sdk-node/src/inner-options';

const SERVER_PORT = 51051;

const memoryExporter = new InMemorySpanExporter();
const provider = new BasicTracerProvider();
instrumentation.setTracerProvider(provider);
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

describe('Capturing gRPC Metadata/Bodies', () => {
  const request = new HelloRequest();
  request.setName(REQUEST_MESSAGE);
  const client = new GreeterClient(
    `localhost:${SERVER_PORT}`,
    grpc.credentials.createInsecure()
  );

  before(done => {
    setInnerOptions({ payloadsEnabled: true });
    instrumentation.enable();
    server.bindAsync(
      `localhost:${SERVER_PORT}`,
      grpc.ServerCredentials.createInsecure(),
      () => {
        server.start();
        console.log('server listening');
        done();
      }
    );
  });

  beforeEach(done => {
    memoryExporter.reset();
    utils.cleanEnvironmentVariables();
    // we need to make the grpc call before the actual test because the client wrapper doesnt
    // end the span until after the callback function returns
    client.sayHello(request, REQUEST_METADATA, (err, response) => {
      if (err) throw err;
      done();
    });
  });

  after(() => {
    server.forceShutdown();
  });

  it('should capture request/response metadata & body', done => {
    const [serverSpan, clientSpan] = memoryExporter.getFinishedSpans();
    assertExpectedObj(
      serverSpan,
      REQUEST_METADATA.getMap(),
      CiscoSemanticAttributes.RPC_REQUEST_METADATA
    );
    assertExpectedObj(
      clientSpan,
      REQUEST_METADATA.getMap(),
      CiscoSemanticAttributes.RPC_REQUEST_METADATA
    );
    assertExpectedObj(
      clientSpan,
      RESPONSE_METADATA.getMap(),
      CiscoSemanticAttributes.RPC_RESPONSE_METADATA
    );

    assert.strictEqual(
      serverSpan.attributes[CiscoSemanticAttributes.RPC_REQUEST_BODY],
      REQUEST_MESSAGE
    );

    assert.strictEqual(
      clientSpan.attributes[CiscoSemanticAttributes.RPC_REQUEST_BODY],
      REQUEST_MESSAGE
    );

    assert.strictEqual(
      serverSpan.attributes[CiscoSemanticAttributes.RPC_RESPONSE_BODY],
      RESPONSE_MESSAGE
    );

    assert.strictEqual(
      clientSpan.attributes[CiscoSemanticAttributes.RPC_RESPONSE_BODY],
      RESPONSE_MESSAGE
    );

    done();
  });
});
