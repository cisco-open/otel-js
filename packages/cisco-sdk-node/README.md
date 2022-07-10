# Cisco SDK Node
[![NPM Published Version][npm-image]][npm-url]
[![Apache License][license-image]][license-image]

This package provides OpenTelemetry-compliant tracing to Javascript applications for the collection of distributed tracing and performance metrics in [Cisco Telescope](https://console.telescope.app/?utm_source=github).


## Installation

```bash
npm install --save @cisco-telescope/cisco-sdk-node
```

## Usage

```javascript
// tracing.js

const { ciscoTracing } = require('@cisco-telescope/cisco-sdk-node');

const userOptions = {
  serviceName: 'my-app-name',
  ciscoToken: 'cisco-token',
};

ciscoTracing.init(userOptions); // init() is an asynchronous function. Consider calling it in 'async-await' format
```

## License

APACHE 2.0 - See [LICENSE][license-url] for more information.

[npm-url]: https://www.npmjs.com/package/@cisco-telescope/cisco-sdk-node
[npm-image]: https://img.shields.io/npm/v/@cisco-telescope/cisco-sdk-node/latest?label=%40cisco-telescope%2Fcisco-sdk-node&style=for-the-badge
[license-url]: https://github.com/https://github.com/cisco-open/otel-js/blob/main/LICENSE
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=for-the-badge
