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
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import grpc = require('@grpc/grpc-js');
import {_configDefaultOptions, Options} from "./options";

export function init(userOptions: Options) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const options = _configDefaultOptions(userOptions);

  if (!options) {
    diag.error('FSO default options is not properly configured.')
    return;
  }

  const metadata = new grpc.Metadata();
  metadata.set('X-Epsagon-Token', options.FSOToken);

  const collectorOptions = {
    url: options.FSOEndpoint,
  };

  // create trace provider
  const provider = new NodeTracerProvider();

  // option to create console exporter

  // create grpc otlp exporter
  const traceExporter = new OTLPTraceExporter(collectorOptions);

  // put exported inside bacth processor
  // put batch processor inside provider
  provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));

  // register the provider
  provider.register();

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
    ],
  });
}
