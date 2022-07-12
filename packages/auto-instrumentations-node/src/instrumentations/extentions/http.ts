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

import { SemanticAttributes } from 'cisco-opentelemetry-specifications';

import {
  HttpInstrumentationConfig,
  HttpResponseCustomAttributeFunction,
  HttpRequestCustomAttributeFunction,
  ResponseEndArgs,
} from '@opentelemetry/instrumentation-http';
import { IncomingMessage, ServerResponse } from 'http';
import { AttributeValue, isSpanContextValid } from '@opentelemetry/api';
import { PayloadHandler } from '../utils/PayloadHandler';
import { addAttribute, addFlattenedObj } from '../utils/utils';

export function configureHttpInstrumentation(
  instrumentation: Instrumentation,
  options: Options
) {
  if (
    typeof instrumentation['setConfig'] !== 'function' ||
    typeof instrumentation['getConfig'] !== 'function'
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

    addFlattenedObj(span, SemanticAttributes.HTTP_REQUEST_HEADER, headers);

    const bodyHandler = new PayloadHandler(
      options,
      headers['content-encoding'] as string
    );
    if (request instanceof IncomingMessage) {
      // request body capture
      const listener = (chunk: any) => {
        bodyHandler.addChunk(chunk);
      };

      request.on('data', listener);
      request.once('end', () => {
        bodyHandler.setPayload(span, SemanticAttributes.HTTP_REQUEST_BODY);
        request.removeListener('data', listener);
      });
    }
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

    addFlattenedObj(span, SemanticAttributes.HTTP_RESPONSE_HEADER, headers);

    const bodyHandler = new PayloadHandler(
      options,
      headers['content-encoding'] as string
    );

    //add http.response.body for the server response msg
    if (response instanceof ServerResponse) {
      const originalEnd = response.end;
      response.end = function (..._args: ResponseEndArgs) {
        response.end = originalEnd;
        bodyHandler.setPayload(span, SemanticAttributes.HTTP_RESPONSE_BODY);
        addAttribute(
          span,
          SemanticAttributes.HTTP_RESPONSE_BODY,
          _args[0] as AttributeValue
        );
        return response.end.apply(this, arguments as never);
      };
    }

    //add http.response.body for the client incoming msg
    if (response instanceof IncomingMessage) {
      const listener = (chunk: any) => {
        bodyHandler.addChunk(chunk);
      };
      response.on('data', listener);

      response.prependOnceListener('end', () => {
        bodyHandler.setPayload(span, SemanticAttributes.HTTP_RESPONSE_BODY);
        response.removeListener('data', listener);
      });
    }
  };
}
