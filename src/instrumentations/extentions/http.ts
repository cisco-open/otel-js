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
import { Instrumentation } from '@opentelemetry/instrumentation';
import { Options } from '../../options';

import {
  HttpInstrumentationConfig,
  HttpResponseCustomAttributeFunction,
  HttpRequestCustomAttributeFunction,
} from '@opentelemetry/instrumentation-http';
import { IncomingMessage } from 'http';
import { isSpanContextValid } from '@opentelemetry/api';

export function configureHttpInstrumentation(
  instrumentation: Instrumentation,
  options: Options
) {
  if (
    typeof instrumentation['setConfig'] !== 'function' ||
    typeof instrumentation['_getConfig'] !== 'function'
  ) {
    return;
  }
  let config = instrumentation.getConfig() as HttpInstrumentationConfig;

  if (config === undefined) {
    config = {};
  }

  const responseHook = createHttpResponseHook(options);

  if (config.responseHook === undefined) {
    config.responseHook = responseHook;
  } else {
    const original = config.responseHook;
    config.responseHook = function (this: unknown, span, response) {
      responseHook(span, response);
      original.call(this, span, response);
    };
  }

  const requestHook = createHttpRequestHook(options);
  if (config.requestHook === undefined) {
    config.requestHook = requestHook;
  } else {
    const original = config.requestHook;
    config.requestHook = function (this: unknown, span, request) {
      requestHook(span, request);
      original.call(this, span, request);
    };
  }
  instrumentation.setConfig(config);
}

function createHttpRequestHook(
  options: Options
): HttpRequestCustomAttributeFunction {
  return (span, request) => {
    const spanContext = span.spanContext();

    if (!isSpanContextValid(spanContext)) {
      return;
    }

    const headers =
      request instanceof IncomingMessage
        ? request.headers
        : request.getHeaders();
    for (const headerKey in headers) {
      const headerValue = headers[headerKey];

      if (headerValue === undefined) {
        continue;
      }
      span.setAttribute(
        `http.request.header.${headerKey.toLocaleLowerCase()}`,
        headerValue
      );
    }

    /* TODO: add body capture
    if (request instanceof IncomingMessage) {
      // request body capture
      const listener = (chunk: any) => {
        console.log('Dataaa: ', chunk);
      };

      request.on('data', listener);
      request.once('end', () => {
        request.removeListener('data', listener);
      });
    }
     */
  };
}

function createHttpResponseHook(
  options: Options
): HttpResponseCustomAttributeFunction {
  return (span, response) => {
    const spanContext = span.spanContext();

    if (!isSpanContextValid(spanContext)) {
      return;
    }

    const headers =
      response instanceof IncomingMessage
        ? response.headers
        : response.getHeaders();
    for (const headerKey in headers) {
      const headerValue = headers[headerKey];

      if (headerValue === undefined) {
        continue;
      }

      span.setAttribute(
        `http.response.header.${headerKey.toLocaleLowerCase()}`,
        headerValue
      );
    }

    // request body capture
    /* TODO: add body capture
    if (response instanceof IncomingMessage) {
      const listener = (chunk: any) => {
        console.log('Dataaa: ', chunk);
      };

      response.on('data', listener);
      response.once('end', () => {
        response.removeListener('data', listener);
      });
    }
    */
  };
}
