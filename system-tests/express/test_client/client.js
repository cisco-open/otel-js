'use strict';

const got = require('got');
got(process.env.SERVER_URL, {
  retry: {
    errorCodes: ['ECONNREFUSED'],
    maxRetryAfter: 1000,
  },
});
console.log('Hello from the client');
