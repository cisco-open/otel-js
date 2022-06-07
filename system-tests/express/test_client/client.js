'use strict';

const got = require('got');
got(process.env.SERVER_URL ?? 'http://0.0.0.0:7080', {
  retry: {
    errorCodes: ['ECONNREFUSED'],
    maxRetryAfter: 1000,
  },
});
console.log('Hello from the client');
