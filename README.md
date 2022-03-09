# otel-js

[![NPM Published Version][npm-image]][npm-url]
[![Apache License][license-image]][license-image]
[![Coverage][coverage-image]][coverage-url]

<p><a>
   <img src=https://github.com/epsagon/otel-js/actions/workflows/ci.yaml/badge.svg?style=for-the-badge>
</a></p>

An Alpha version

This package provides a Cisco Launcher for OpenTelemetry Node.js

## Installation

To install Cisco launcher for OpenTelemtry simply run:

```sh
npm install cisco-opentelemetry-node
```

## Usage

### javascript

```javascript
const { ciscoTracing } = require('cisco-opentelemetry-node');

const userOptions = {
  serviceName: 'my-app-name',
  ciscoToken: 'cisco-token',
  exporters: [
    {
      collectorEndpoint: 'grpc://localhost:4317',
    },
  ],
};

ciscoTracing.init(userOptions);
```

### typescript

```javascript
import { ciscoTracing, Options } from 'cisco-opentelemetry-node';

const userOptions: Partial<Options> = {
  serviceName: 'my-app-name',
  ciscoToken: 'sometoken',
  exporters: [
    {
      collectorEndpoint: 'http://localhost:4317',
    },
  ],
};
ciscoTracing.init(userOptions);
```

## Configuration

Advanced options can be configured as a parameter to the init() method:

| Parameter       | Env                    | Type    | Default       | Description                                                       |
| --------------- | ---------------------- | ------- | ------------- | ----------------------------------------------------------------- |
| ciscoToken      | CISCO_TOKEN            | string  | -             | Cisco account token                                               |
| serviceName     | OTEL_SERVICE_NAME      | string  | `application` | Application name that will be set for traces                      |
| debug           | CISCO_DEBUG            | string  | `false`       | Debug logs                                                        |
| payloadsEnabled | CISCO_PAYLOADS_ENABLED | boolean | `false`       | The number in bytes of the maximum payload to capture for request |
| maxPayloadSize  | CISCO_MAX_PAYLOAD_SIZE | number  | `1024`        | The number in bytes of the maximum payload to capture for request |

Exporter options

| Parameter         | Env                     | Type                | Default                 | Description                                                                                                                                         |
| ----------------- | ----------------------- | ------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| collectorEndpoint | OTEL_COLLECTOR_ENDPOINT | string              | `http://localhost:4317` | The address of the trace collector to send traces to                                                                                                |
| type              | OTEL_EXPORTER_TYPE      | string              | `otlp-grpc`             | The exporter type to use (Currently `otlp-grpc`, `otlp-http` are supported). Multiple exporter option available via init function see example below |
| customHeaders     | None                    | Map<string, string> | {}                      | Extra headers to inject to the exporter (in gRPC to the metadata, in http to Headers)                                                               |

Multiple exporter can be initialize using ciscoTracing init function with the following options:

```javascript
const userOptions: Partial<Options> = {
  collectorEndpoint: 'http://localhost:4317',
  serviceName: 'my-app-name',
  ciscoToken: 'sometoken',
  exporters: [
    {
      collectorEndpoint: 'grpc://localhost:4317',
      type: 'otlp-grpc',
    },
    {
      collectorEndpoint: 'http://localhost:4317',
      type: 'otlp-http',
    },
  ],
};
ciscoTracing.init(userOptions);
```

To test the launcher:

1. verify you have docker installed and use the config.yaml in this repository to run the collector:
   Note: you should supply full path in -v argument:

   ```javascript
   docker run --rm -p 13133:13133 -p 14250:14250 -p 14268:14268 \
         -p 55678-55679:55678-55679 -p 4317:4317 -p 8888:8888 -p 9411:9411 \
               -v "${HOME}/YOUR_PATH/otel-js/test/config.yaml":/otel-local-config.yaml \
         --name otelcol otel/opentelemetry-collector \
         --config otel-local-config.yaml;
   ```

2. Build from the root:

   ```sh
   npm run build
   ```

3. Run from the root:

   ```sh
   node lib/test/app.js
   ```

4. Go to <http://localhost:8081/> and verify you see "Hello World"
5. Check the collector, you should see a trace there.

[npm-url]: https://www.npmjs.com/package/cisco-opentelemetry-node
[npm-image]: https://img.shields.io/github/v/release/epsagon/otel-js?include_prereleases&style=for-the-badge
[license-url]: https://github.com/https://github.com/epsagon/otel-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=for-the-badge
[coverage-url]: https://codecov.io/gh/epsagon/otel-js/branch/main/
[coverage-image]: https://img.shields.io/codecov/c/github/epsagon/otel-js?style=for-the-badge
