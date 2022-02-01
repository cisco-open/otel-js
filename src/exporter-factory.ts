import * as util from 'util';

import { SpanExporter } from "@opentelemetry/sdk-trace-base";
import { Options } from "./options";
import { Metadata } from '@grpc/grpc-js';

import { OTLPTraceExporter as GRPCTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { OTLPTraceExporter as HTTPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { diag } from "@opentelemetry/api";

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
            'X-Epsagon-Token': options.FSOToken
        }
    }
    return new HTTPTraceExporter(collectorOptions)
}

const SupportedExportersMap :Record<string, SpanExporterFactory> = {
    'default': otlpGrpcSpanFactory,
    'otlp-grpc': otlpGrpcSpanFactory,
    'otlp-http': otlpHttpSpanFactory,
}

export function exporterFactory(options: Options): SpanExporter | undefined {
    const factory = SupportedExportersMap[options.exporterType || 'undefined'];

    if (!factory) {
        diag.error(
            `Invalid value for options.exporterType: ${util.inspect(
                options.exporterType
            )}. Pick one of ${util.inspect(Object.keys(SupportedExportersMap), {
                compact: true,
            })} or leave undefined.`
        );
        return;
    }

    return factory(options);
}



