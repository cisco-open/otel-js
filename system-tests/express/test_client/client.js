'use strict';

const got = require('got')
got("http://server:7080", {
  retry: {
    errorCodes: ['ECONNREFUSED'],
    maxRetryAfter: 1000,
  },
});
console.log('Hello from the client');
