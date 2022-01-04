const opentelemetry = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { context, propagation, trace } = require('@opentelemetry/api');
const { BatchSpanProcessor} = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

//create trace provider
const provider = new NodeTracerProvider();

//option to create console exporter
//const consoleExporter = new opentelemetry.tracing.ConsoleSpanExporter();

//create grpc otlp exporter
const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4317'
  //optionally put headers
});

//put exported inside bacth processor
//put batch processor inside provider
provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));

//register the provider
provider.register(); //optinally supply contextManager and propagator

registerInstrumentations({
    tracerProvider: provider, // optional, only if global TracerProvider shouldn't be used
    //meterProvider: meterProvider, // optional, only if global MeterProvider shouldn't be used
    instrumentations: [
      getNodeAutoInstrumentations(),
      //new HttpInstrumentation(),
  ],
});
