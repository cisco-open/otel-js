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

// import { ciscoTracing } from '../';

const userOptions = {
  // serviceName: 'my-http-server',
  // ciscoToken: 'eps_dXHR9PlWuKtHEQe0-38YlUtjKIK3new4aEa0SShiYt8',
  payloadsEnabled: true,
  debug: true,
  maxPayloadSize: 1000,
  // exporters: [
  //   {
  //     collectorEndpoint: 'https://opentelemetry.tc.epsagon.com/traces',
  //     type: 'otlp-http',
  //     customHeaders: {
  //       'x-epsagon-token': '3f9032c7-18f7-4951-be8c-f1738f504afc',
  //     },
  //   },
  // ],
};
// ciscoTracing.init(userOptions);

import { getCiscoNodeAutoInstrumentations } from '../instrumentations';
// import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const api = require('@opentelemetry/api');
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  Resource,
  detectResources,
  processDetector,
  envDetector,
} from '@opentelemetry/resources';
api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);
// import { context, SpanStatusCode } from '@opentelemetry/api';
// import getSpan from '@opentelemetry/api';

// import { trace } from '@opentelemetry/api';
// const tracer = trace.getTracer('my-application', '0.1.0');

// const provider = new BasicTracerProvider();
const instrumentations = getCiscoNodeAutoInstrumentations({}, userOptions);
const collectorOptions = {
  url: 'https://production.cisco-udp.com/trace-collector',
  headers: {
    authorization: 'Bearer eps_dXHR9PlWuKtHEQe0-38YlUtjKIK3new4aEa0SShiYt8',
  },
};

async function asyncCall() {
  registerInstrumentations({
    instrumentations: instrumentations,
  });

  const detectedResources = await detectResources({
    detectors: [envDetector, processDetector],
  });

  const ciscoResource = new Resource({
    'service.name': 'my-http-server',
  });

  const provider = new NodeTracerProvider({
    resource: ciscoResource.merge(detectedResources),
  });

  provider.addSpanProcessor(
    new SimpleSpanProcessor(new OTLPTraceExporter(collectorOptions))
  );
  provider.register();

  const express = require('express');
  const PORT = process.env.PORT || '8081';
  const app = express();

  app.get('/', (req, res) => {
    res.send('Hello world from otel-js');
  });

  app.post('/test_post_end', (req: any, res: any) => {
    //   const span = tracer.startSpan('my-span-name');
    //   const ctx = trace.setSpan(context.active(), span);
    //   const user = await context.with(ctx, getUser);
    //   console.log(user);
    //   span.setAttribute('manual-prefix', 'manual-value');
    //   span.end();
    // const body = `${JSON.stringify(req.test)}`;

    // const body = 'response body';
    // res.writeHead(200, { 'Content-Type': 'application/json' });
    // res.end(body);

    const body = 'response body';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(body);
    res.end();
  });

  app.listen(parseInt(PORT, 10), () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
  });

  // async function getUser() {
  //   // when this span is created, it will automatically use the span from the context as its parent
  //   const span = tracer.startSpan('SELECT ShopDb.Users');
  //   const user = 'some-user';

  //   span.setStatus({
  //     code: SpanStatusCode.OK,
  //   });
  //   span.end();
  //   return user;
  // }
}

asyncCall();
