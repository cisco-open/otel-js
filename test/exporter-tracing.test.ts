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

import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Options } from '../src';
import { exporterFactory } from '../src/exporter-factory';
import * as assert from 'assert';
import * as utils from './utils';
import { ExporterOptions } from '../src/options';

describe('Tracing test', () => {
  beforeEach(() => {
    utils.cleanEnvironmentVariables();
  });

  it('setup gRPC exporter', () => {
    const exporterOptions: ExporterOptions = {
      type: 'otlp-grpc',
      collectorEndpoint: 'some-collector:4317',
    };
    const userOptions = {
      serviceName: 'my-app-name',
      ciscoToken: 'cisco-token',
      debug: false,
      exporters: [exporterOptions],
    };

    const traceExporter = exporterFactory(
      <Options>userOptions
    )[0] as OTLPGrpcTraceExporter;
    assert(traceExporter);
    assert.deepEqual(traceExporter.metadata?.get('x-cisco-token'), [
      userOptions.ciscoToken,
    ]);
    assert.strictEqual(traceExporter.url, exporterOptions.collectorEndpoint);
  });

  it('setup HTTP exporter', () => {
    const exporterOptions: ExporterOptions = {
      type: 'otlp-http',
      collectorEndpoint: 'some-collector:4317',
    };
    const userOptions = {
      serviceName: 'my-app-name',
      ciscoToken: 'cisco-token',
      debug: false,
      exporters: [exporterOptions],
    };

    const traceExporter = exporterFactory(
      <Options>userOptions
    )[0] as OTLPHttpTraceExporter;
    assert(traceExporter);
    assert.deepEqual(
      traceExporter.headers['X-Epsagon-Token'],
      userOptions.ciscoToken
    );
    assert.strictEqual(traceExporter.url, exporterOptions.collectorEndpoint);
  });

  it('setup both HTTP and gRPC exporters', () => {
    const httpExporterOptions: ExporterOptions = {
      type: 'otlp-http',
      collectorEndpoint: 'some-collector:4317',
    };
    const grpcExporterOptions: ExporterOptions = {
      type: 'otlp-grpc',
      collectorEndpoint: 'some-collector:4317',
    };
    const userOptions = {
      serviceName: 'my-app-name',
      ciscoToken: 'cisco-token',
      debug: false,
      exporters: [httpExporterOptions, grpcExporterOptions],
    };

    const httpExporter = exporterFactory(
      <Options>userOptions
    )[0] as OTLPHttpTraceExporter;
    assert(httpExporter);
    assert.deepEqual(
      httpExporter.headers['X-Epsagon-Token'],
      userOptions.ciscoToken
    );
    assert.strictEqual(httpExporter.url, httpExporterOptions.collectorEndpoint);

    const grpcExporter = exporterFactory(
      <Options>userOptions
    )[1] as OTLPGrpcTraceExporter;
    assert(grpcExporter);
    assert.deepEqual(grpcExporter.metadata?.get('x-cisco-token'), [
      userOptions.ciscoToken,
    ]);
    assert.strictEqual(grpcExporter.url, grpcExporterOptions.collectorEndpoint);
  });

  it('setup undefined exporter', () => {
    const exporterOptions: ExporterOptions = {
      type: 'undefined-exporter',
      collectorEndpoint: 'some-collector:4317',
    };
    const userOptions = {
      serviceName: 'my-app-name',
      ciscoToken: 'cisco-token',
      debug: false,
      exporters: [exporterOptions],
    };

    const traceExporters = exporterFactory(<Options>userOptions);
    assert(traceExporters.length === 0);
  });
});
