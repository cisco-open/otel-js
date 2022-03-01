'use strict';

const { ciscoTracing } = require('cisco-opentelemetry-node');
const api = require('@opentelemetry/api');
api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const userOptions = {
  serviceName: 'my-app-name',
  ciscoToken: 'fso-token',
  exporters: [
    {
      collectorEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      type: 'otlp-grpc',
    },
  ],
};

ciscoTracing.init(userOptions);

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

// Skip the actual server setup. Just make sure that our agent don't throw an exception
// app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
