'use strict';

const { ciscoTracing } = require('cisco-opentelemetry-node');
const api = require('@opentelemetry/api');
api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const userOptions = {
  serviceName: 'my-app-name',
  ciscoToken: 'fso-token',
  exporters: [
    {
      // collectorEndpoint: "grpc://a6287cf737f184354bc16f6dc3597d36-702985657.us-east-1.elb.amazonaws.com",
      //collectorEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      collectorEndpoint:
        'grpc://temp-LoadB-3CZV4U1QU75S-508041e47c972a61.elb.us-east-1.amazonaws.com:8080',
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

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
