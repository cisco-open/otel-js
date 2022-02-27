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
const mongodb = require('mongodb');

// Constants
const PORT = 7080;
const HOST = '0.0.0.0';

const mongoUri = process.env.MONGO_URL;
const dbName = 'store';

// App
const app = express();
app.get('/', (req, res) => {
  res.status(200).send('Hallo Worldz');
});

app.get('/mongo', (req, res) => {
  accessCollection(mongoUri, dbName, 'test')
    .then(result => {
      const collection = result.collection;
      const insertData = [{ a: 1 }, { a: 2 }, { a: 3 }];
      collection.insertMany(insertData, (err, result) => {
        if (err) {
          res.status(400).send('Command failed: ' + err);
        } else {
          res.status(200).send('Command success!');
        }
      });
    })
    .catch(err => {
      res.status(501).send('Failed to connect mongo, err: ' + err);
    });
});

/**
 * Access the mongodb collection.
 * @param url The mongodb URL to access.
 * @param dbName The mongodb database name.
 * @param collectionName The mongodb collection name.
 * @param options The mongodb client config options.
 */
function accessCollection(url, dbName, collectionName, options) {
  return new Promise((resolve, reject) => {
    mongodb.MongoClient.connect(url, { serverSelectionTimeoutMS: 1000 })
      .then(client => {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        resolve({ client, collection });
      })
      .catch(reason => {
        reject(reason);
      });
  });
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
