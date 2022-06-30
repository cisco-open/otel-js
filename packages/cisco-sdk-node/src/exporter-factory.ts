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
import { inspect } from 'util';

import { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { ExporterOptions, Options } from './options';
import * as grpc from '@grpc/grpc-js';

import { OTLPTraceExporter as GRPCTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPTraceExporter as HTTPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { diag } from '@opentelemetry/api';

type SpanExporterFactory = (
  options: Options,
  exporterOptions: ExporterOptions
) => SpanExporter;

function otlpGrpcSpanFactory(
  options: Options,
  exporterOptions: ExporterOptions
): SpanExporter {
  const metadata = new grpc.Metadata();

  for (const key in exporterOptions.customHeaders) {
    const value = exporterOptions.customHeaders[key];
    metadata.set(key, value);
  }

  const collectorOptions = {
    url: exporterOptions.collectorEndpoint,
    metadata: metadata,
  };

  return new GRPCTraceExporter(collectorOptions);
}

function otlpHttpSpanFactory(
  options: Options,
  exporterOptions: ExporterOptions
): SpanExporter {
  const collectorOptions = {
    url: exporterOptions.collectorEndpoint,
    headers: exporterOptions.customHeaders,
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
  for (const index in options.exporters) {
    const factory =
      SupportedExportersMap[options.exporters[index].type || 'undefined'];

    if (!factory) {
      diag.error(
        `Invalid value for options.exporterType: ${inspect(
          options.exporters[index].type
        )}. Pick one of ${inspect(Object.keys(SupportedExportersMap), {
          compact: true,
        })} or leave undefined.`
      );
      return [];
    }
    exporters.push(factory(options, options.exporters[index]));
  }
  return exporters;
}
