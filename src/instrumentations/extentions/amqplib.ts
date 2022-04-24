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
  AmqplibConsumerCustomAttributeFunction,
  AmqplibInstrumentationConfig,
  AmqplibPublishCustomAttributeFunction,
} from 'opentelemetry-instrumentation-amqplib';
import { isSpanContextValid } from '@opentelemetry/api';
import { addFlattenedObj } from '../utils/utils';
import { PayloadHandler } from '../utils/PayloadHandler';
import { SemanticAttributes } from 'cisco-opentelemetry-specifications';

export function configureAmqplibInstrumentation(
  instrumentation: Instrumentation,
  options: Options
) {
  if (
    typeof instrumentation['getConfig'] !== 'function' ||
    typeof instrumentation['setConfig'] !== 'function'
  ) {
    return;
  }
  let config = instrumentation.getConfig() as AmqplibInstrumentationConfig;

  if (config === undefined) {
    config = {};
  }

  const consumeHook = createConsumeHook(options);

  if (config.consumeHook === undefined) {
    config.consumeHook = consumeHook;
  } else {
    const original = config.consumeHook;
    config.consumeHook = function (this: unknown, span, message) {
      consumeHook(span, message);
      original.call(this, span, message);
    };
  }

  const publishHook = createPublishHook(options);

  if (config.publishHook === undefined) {
    config.publishHook = publishHook;
  } else {
    const original = config.publishHook;
    config.publishHook = function (this: unknown, span, publishParams) {
      publishHook(span, publishParams);
      original.call(this, span, publishParams);
    };
  }
}

function createPublishHook(
  options: Options
): AmqplibPublishCustomAttributeFunction {
  return (span, publishParams) => {
    const spanContext = span.spanContext();
    if (!isSpanContextValid(spanContext)) {
      return;
    }
    addFlattenedObj(
      span,
      SemanticAttributes.MESSAGING_RABBITMQ_MESSAGE_HEADER.key,
      publishParams.options.headers
    );
    span.setAttribute(
      SemanticAttributes.MESSAGING_RABBITMQ_PAYLOAD_SIZE.key,
      publishParams.content.length
    );
    // TODO: we need to separate the user Options from our using options
    PayloadHandler.setPayload(
      span,
      SemanticAttributes.MESSAGING_RABBITMQ_PAYLOAD.key,
      publishParams.content,
      options.maxPayloadSize
    );
  };
}

function createConsumeHook(
  options: Options
): AmqplibConsumerCustomAttributeFunction {
  return (span, message) => {
    const spanContext = span.spanContext();
    if (!isSpanContextValid(spanContext)) {
      return;
    }

    addFlattenedObj(
      span,
      SemanticAttributes.MESSAGING_RABBITMQ_MESSAGE_HEADER.key,
      message.properties.headers
    );
    span.setAttribute(
      SemanticAttributes.MESSAGING_RABBITMQ_PAYLOAD_SIZE.key,
      message.content.length
    );

    PayloadHandler.setPayload(
      span,
      SemanticAttributes.MESSAGING_RABBITMQ_PAYLOAD.key,
      message.content,
      options.maxPayloadSize
    );
  };
}
