// import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import grpc = require('@grpc/grpc-js');


export function init(_configData: any) {
  const configData = _configData;
  
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  
  const metadata = new grpc.Metadata();
  // For instance, an API key or access token might go here.
  metadata.set('X-Epsagon-Token', configData.token);

  const collectorOptions = {
    //serviceName: configData.appName || 'DEFAULT APPLICATION NAME',
    url: configData.collectorURL,
    // credentials: grpc.credentials.createSsl(),
    // metadata,
    // headers: {
    //   'X-Epsagon-Token': `${configData.token}`,
    // },
  };
  diag.info('configData: ', configData);


  //create trace provider
  const provider = new NodeTracerProvider();

  //option to create console exporter
  //const consoleExporter = new opentelemetry.tracing.ConsoleSpanExporter();

  //create grpc otlp exporter
  const traceExporter = new OTLPTraceExporter(collectorOptions);

  //put exported inside bacth processor
  //put batch processor inside provider
  provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));

  //register the provider
  provider.register(); //optinally supply contextManager and propagator

  registerInstrumentations({
      tracerProvider: provider, // optional, only if global TracerProvider shouldn't be used
      //meterProvider: meterProvider, // optional, only if global MeterProvider shouldn't be used
      instrumentations: [
        // getNodeAutoInstrumentations(),
        new HttpInstrumentation(),
    ],
  });
}