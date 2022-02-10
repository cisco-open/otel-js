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
import * as util from 'util';

import { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { Options } from './options';
import { Metadata } from '@grpc/grpc-js';

import { OTLPTraceExporter as GRPCTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPTraceExporter as HTTPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { diag } from '@opentelemetry/api';

type SpanExporterFactory = (options: Options) => SpanExporter;

function otlpGrpcSpanFactory(options: Options): SpanExporter {
  const metadata = new Metadata();
  metadata.set('X-FSO-Token', options.FSOToken);

  const collectorOptions = {
    url: options.FSOEndpoint,
    metadata,
  };

  return new GRPCTraceExporter(collectorOptions);
}

function otlpHttpSpanFactory(options: Options): SpanExporter {
  const collectorOptions = {
    url: options.FSOEndpoint,
    headers: {
      // TODO: Change this to FSO header after FSO alpha is out
      'X-Epsagon-Token': options.FSOToken,
    },
  };
  return new HTTPTraceExporter(collectorOptions);
}

const SupportedExportersMap: Record<string, SpanExporterFactory> = {
  default: otlpGrpcSpanFactory,
  'otlp-grpc': otlpGrpcSpanFactory,
  'otlp-http': otlpHttpSpanFactory,
};

export function exporterFactory(options: Options): SpanExporter[] {
  const exporters: SpanExporter[] = [];
  for (const index in options.exporterTypes) {
    const factory =
      SupportedExportersMap[options.exporterTypes[index] || 'undefined'];

    if (!factory) {
      diag.error(
        `Invalid value for options.exporterType: ${util.inspect(
          options.exporterTypes
        )}. Pick one of ${util.inspect(Object.keys(SupportedExportersMap), {
          compact: true,
        })} or leave undefined.`
      );
      return [];
    }
    exporters.push(factory(options));
  }
  return exporters;
}
