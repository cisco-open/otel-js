# otel-js

[![NPM Published Version][npm-image]][npm-url]
[![Apache License][license-image]][license-image]
[![Coverage][coverage-image]][coverage-url]

<p><a>
   <img src=https://github.com/cisco-open/otel-js/actions/workflows/ci.yaml/badge.svg?style=for-the-badge>
</a></p>

![Trace](trace.png)

This package provides OpenTelemetry-compliant tracing to Javascript applications for the collection of distributed tracing and performance metrics in [Cisco Telescope](https://console.telescope.app/?utm_source=github).

## Contents

- [otel-js](#otel-js)
  - [Contents](#contents)
  - [Installation](#installation)
    - [Install packages](#install-packages)
    - [Library initialization](#library-initialization)
      - [javascript](#javascript)
      - [typescript](#typescript)
    - [OpenTelemetry Collector Configuration](#opentelemetry-collector-configuration)
      - [Configure custom trace exporter](#configure-custom-trace-exporter)
      - [Configure custom OpenTelemetry collector to export trace data to Cisco Telescope's external collector.](#configure-custom-opentelemetry-collector-to-export-trace-data-to-cisco-telescopes-external-collector)
    - [Existing OpenTelemetry Instrumentation](#existing-opentelemetry-instrumentation)
  - [Supported Runtimes](#supported-runtimes)
  - [Frameworks](#frameworks)
  - [Supported Libraries](#supported-libraries)
  - [Configuration](#configuration)
  - [Getting Help](#getting-help)
  - [Opening Issues](#opening-issues)
  - [License](#license)

## Installation

### Install packages

To install Cisco OpenTelemetry Distribution simply run:

```sh
npm install cisco-opentelemetry-node
```

### Library initialization

> Cisco OpenTelemetry Distribution is activated and instruments the supported libraries once the module is imported.

#### javascript

```javascript
const { ciscoTracing } = require('cisco-opentelemetry-node');

const userOptions = {
  serviceName: 'my-app-name',
  ciscoToken: 'cisco-token',
};

await ciscoTracing.init(userOptions);
```

#### typescript

```javascript
import { ciscoTracing, Options } from 'cisco-opentelemetry-node';

const userOptions: Partial<Options> = {
  serviceName: 'my-app-name',
  ciscoToken: 'sometoken',
};
await ciscoTracing.init(userOptions);
```

### OpenTelemetry Collector Configuration

> By default, Cisco OpenTelemetry Distribution exports data directly to [Cisco Telescope's](https://console.telescope.app/?utm_source=github) infrastructure backend.
> **Existing** OpenTelemetery Collector is supported, the following configuration can be applied

#### Configure custom trace exporter

> Cisco OpenTelemetry Distribution supports configure multiple custom exporters.
> Example for create OtlpGrpc Span exporter to local OpenTelemetry collector including metadata(headers) injection:

```javascript
const { ciscoTracing } = require('cisco-opentelemetry-node');

const userOptions = {
  serviceName: 'my-app-name',
  ciscoToken: 'cisco-token',
  exporters: [
    {
      type: 'otlp-grpc',
      collectorEndpoint: 'grpc://localhost:4317',
      customHeaders: {
        'someheader-to-inject': 'header value',
      },
    },
  ],
};

await ciscoTracing.init(userOptions);
```

#### Configure custom OpenTelemetry collector to export trace data to [Cisco Telescope's](https://console.telescope.app/?utm_source=github) external collector.

```yaml
collector.yaml ...

exporters:
  otlphttp:
    traces_endpoint: https://production.cisco-udp.com/trace-collector:80
    headers:
      authorization: <Your Telescope Token>
    compression: gzip


service:
  pipelines:
    traces:
      exporters: [otlphttp]
```

### Existing OpenTelemetry Instrumentation

> Notice: Only relevant if interested in streaming existing OpenTelemetry workloads.
> [Cisco Telescope](https://console.telescope.app/?utm_source=github). supports native OpenTelemetery traces.

```typescript
const traceProvider = new NodeTracerProvider({
  resource: Resource(),
});
const collectorOptions = {
  url: 'https://production.cisco-udp.com/trace-collector:80',
  headers: {
    authorization: '<Your Telescope Token>',
  },
};
const httpExporter = new HTTPTraceExporter(collectorOptions);
traceProvider.addSpanProcessor(new BatchSpanProcessor(httpExporter));
```

## Supported Runtimes

| Platform Version | Supported |
| ---------------- | --------- |
| Node.JS `v14`    | ✅        |
| Node.JS `v12`    | ✅        |
| Node.JS `v10`    | ✅        |

## Frameworks

> Cisco OpenTelemetry JS Distribution is extending Native OpenTelemetry, supported frameworks [available here](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node#supported-instrumentations).

## Supported Libraries

> Cisco OpenTelemetry JS Distribution is extending Native OpenTelemetry, supported libraries [available here](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node#supported-instrumentations).

Cisco OpenTelemetry JS Distribution provides out-of-the-box instrumentation (tracing) and advanced **payload collections** for many popular frameworks and libraries.

| Library | Extended Support Version |
| ------- | ------------------------ |
| http    | Fully supported          |
| aws-sdk | V2, V3                   |
| amqplib | ^0.5.5                   |
| grpc-js | ^1.X                     |
| redis   | ^2.6.0, ^3.0.0           |

## Configuration

Advanced options can be configured as a parameter to the init() method:

| Parameter       | Env                    | Type    | Default       | Description                                                       |
| --------------- | ---------------------- | ------- | ------------- | ----------------------------------------------------------------- |
| ciscoToken      | CISCO_TOKEN            | string  | -             | Cisco account token                                               |
| serviceName     | OTEL_SERVICE_NAME      | string  | `application` | Application name that will be set for traces                      |
| debug           | CISCO_DEBUG            | string  | `false`       | Debug logs                                                        |
| payloadsEnabled | CISCO_PAYLOADS_ENABLED | boolean | `false`       | Whether the span should include paylaods or not according to [this list](https://github.com/epsagon/cisco-otel-distribution-specifications/blob/7594c0d2f6504e59e1b8c238426eba5171155b90/packages/js/src/payload_attributes.ts).  |

Exporter options

| Parameter         | Env                     | Type                | Default                                               | Description                                                                                                                                 |
| ----------------- | ----------------------- | ------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| collectorEndpoint | OTEL_COLLECTOR_ENDPOINT | string              | `https://production.cisco-udp.com/trace-collector:80` | The address of the trace collector to send traces to                                                                                        |
| type              | OTEL_EXPORTER_TYPE      | string              | `otlp-http`                                           | The exporter type to use (Currently only `otlp-http` are supported). Multiple exporter option available via init function see example below |
| customHeaders     | None                    | Map<string, string> | {}                                                    | Extra headers to inject to the exporter (in gRPC to the metadata, in http to Headers)                                                       |

## Getting Help

If you have any issue around using the library or the product, please don't hesitate to:

- Use the [documentation](https://docs.telescope.com).
- Use the help widget inside the product.
- Open an issue in GitHub.

## Opening Issues

If you encounter a bug with the Cisco OpenTelemetry Distribution for JavaScript, we want to hear about it.

When opening a new issue, please provide as much information about the environment:

- Library version, JavaScript runtime version, dependencies, etc.
- Snippet of the usage.
- A reproducible example can really help.

The GitHub issues are intended for bug reports and feature requests.
For help and questions about [Cisco Telescope](https://console.telescope.app/?utm_source=github), use the help widget inside the product.

## License

Provided under the Apache 2.0. See LICENSE for details.

Copyright 2022, Cisco

[npm-url]: https://www.npmjs.com/package/cisco-opentelemetry-node
[npm-image]: https://img.shields.io/github/v/release/cisco-open/otel-js?include_prereleases&style=for-the-badge
[license-url]: https://github.com/https://github.com/cisco-open/otel-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=for-the-badge
[coverage-url]: https://codecov.io/gh/cisco-open/otel-js/branch/main/
[coverage-image]: https://img.shields.io/codecov/c/github/cisco-open/otel-js?style=for-the-badge
