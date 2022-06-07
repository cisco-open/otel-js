const { ciscoTracing } = require('cisco-telescope');
const api = require('@opentelemetry/api');

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const userOptions = {
  debug: true,
  serviceName: 'my-app-name',
  ciscoToken: 'fso-token',
  exporters: [
    {
      collectorEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      type: 'otlp-grpc',
    },
  ],
};

const provider = ciscoTracing.init(userOptions);
