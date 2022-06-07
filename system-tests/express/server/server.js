'use strict';

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

require('http');
const express = require('express');

// Constants
const PORT = 7080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.status(200).send('Hallo Worldz');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);