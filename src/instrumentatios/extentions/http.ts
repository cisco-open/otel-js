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
import {IncomingMessage, ServerResponse} from 'http';
import { diag, isSpanContextValid } from '@opentelemetry/api';

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

        if (request instanceof IncomingMessage) {
            span.setAttribute('req_osher', 'is da milech')
        }
    };
}

function createHttpResponseHook (options: Options ): HttpResponseCustomAttributeFunction  {

    return (span, response) => {
        if (!(response instanceof ServerResponse)) {
            return;
        }

        const spanContext = span.spanContext();

        if (!isSpanContextValid(spanContext)) {
            return;
        }
        span.setAttribute("osher", "is the fucking king")
    }
}
