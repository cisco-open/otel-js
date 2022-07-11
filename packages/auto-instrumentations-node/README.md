# Cisco Auto Node Instrumentations

[![NPM Published Version][npm-image]][npm-url]
[![Apache License][license-image]][license-image]

This module provides a simple way to initialize multiple Node instrumentations,
and to get all Cisco additional payloads

NOTE: This is useful for OTel native user who only wants to get our extra data

## Installation

```bash
npm install --save @cisco-telescope/auto-instrumentations-node
```

## Usage

Cisco OpenTelemetry Auto instrumentations for Node automatically loads instrumentations for Node builtin modules and common packages.

Custom configuration for each of the instrumentations can be passed to the function, by providing an object with the name of the instrumentation as a key, and its configuration as the value.

Also, user can also config the Telescope data collection behavior by passing Options (see [Configuration](#configuration)).

```javascript
// tracing.js

const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const {
  getCiscoNodeAutoInstrumentations,
} = require('@cisco-telescope/auto-instrumentations-node');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector');
const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');

const exporter = new CollectorTraceExporter();
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'basic-service',
  }),
});
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

registerInstrumentations({
  instrumentations: [
    getCiscoNodeAutoInstrumentations(
      {
        // load custom configuration for http instrumentation
        '@opentelemetry/instrumentation-http': {
          applyCustomAttributesOnSpan: span => {
            span.setAttribute('foo2', 'bar2');
          },
        },
      },
      // config Telecope payloads config (All have default values)
      {
        maxPayloadSize: 1337,
      }
    ),
  ],
});
```

## Configuration

Advanced options can be configured as a parameter to the init() method:

| Parameter       | Env                    | Type    | Default | Description                                                                                                                                                                                                                      |
| --------------- | ---------------------- | ------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| payloadsEnabled | CISCO_PAYLOADS_ENABLED | boolean | `true`  | Whether the span should include paylaods or not according to [this list](https://github.com/epsagon/cisco-otel-distribution-specifications/blob/7594c0d2f6504e59e1b8c238426eba5171155b90/packages/js/src/payload_attributes.ts). |
| maxPayloadSize  | MAX_PAYLOAD_SIZE       | int     | 1024    | Max payload size to collect per attribute                                                                                                                                                                                        |

## License

APACHE 2.0 - See [LICENSE][license-url] for more information.

[npm-url]: https://www.npmjs.com/package/@cisco-telescope/auto-instrumentations-node
[npm-image]: https://img.shields.io/npm/v/@cisco-telescope/auto-instrumentations-node/latest?label=%40cisco-telescope%2Fauto-instrumentations-node&style=for-the-badge
[license-url]: https://github.com/https://github.com/cisco-open/otel-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=for-the-badge
