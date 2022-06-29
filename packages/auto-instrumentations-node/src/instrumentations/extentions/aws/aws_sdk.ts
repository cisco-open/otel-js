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
import { Options } from '../../../options';

import {
  AwsSdkInstrumentationConfig,
  AwsSdkResponseCustomAttributeFunction,
  AwsSdkResponseHookInformation,
  AwsSdkRequestCustomAttributeFunction,
  AwsSdkRequestHookInformation,
} from '@opentelemetry/instrumentation-aws-sdk';
import { isSpanContextValid } from '@opentelemetry/api';
import { Span } from '@opentelemetry/api';
import { AwsEventCreator } from './event-creator-interface';
import { SNSEventCreator } from './SNSEventCreator';
import { SQSEventCreator } from './SQSEventCreator';
import { DynamoDBEventCreator } from './DynamoDBEventCreator';

export function configureAwsInstrumentation(
  instrumentation: Instrumentation,
  options: Options
) {
  if (
    typeof instrumentation['getConfig'] !== 'function' ||
    typeof instrumentation['setConfig'] !== 'function'
  ) {
    return;
  }
  let config = instrumentation.getConfig() as AwsSdkInstrumentationConfig;

  if (config === undefined) {
    config = {};
  }

  const requestHook = createAwsSdkRequestHook(options);
  if (config.preRequestHook === undefined) {
    config.preRequestHook = requestHook;
  } else {
    const original = config.preRequestHook;
    config.preRequestHook = function (this: unknown, span, request) {
      requestHook(span, request);
      original.call(this, span, request);
    };
  }

  const responseHook = createAwsSdkResponseHook(options);
  if (config.responseHook === undefined) {
    config.responseHook = responseHook;
  } else {
    const original = config.responseHook;
    config.responseHook = function (this: unknown, span, response) {
      responseHook(span, response);
      original.call(this, span, response);
    };
  }

  instrumentation.setConfig(config);
}

function createAwsSdkRequestHook(
  options: Options
): AwsSdkRequestCustomAttributeFunction {
  return (span: Span, requestInfo: AwsSdkRequestHookInformation) => {
    const spanContext = span.spanContext();
    if (!isSpanContextValid(spanContext)) {
      return;
    }

    const serviceIdentifier = requestInfo.request.serviceName;
    const creator = specificEventCreators.get(serviceIdentifier);
    if (!creator) {
      return;
    }
    creator.requestHandler(span, requestInfo);
  };
}

function createAwsSdkResponseHook(
  options: Options
): AwsSdkResponseCustomAttributeFunction {
  return (span: Span, responseInfo: AwsSdkResponseHookInformation) => {
    const spanContext = span.spanContext();
    if (!isSpanContextValid(spanContext)) {
      return;
    }
    const serviceIdentifier = responseInfo.response.request.serviceName;
    const creator = specificEventCreators.get(serviceIdentifier);
    if (!creator) {
      return;
    }
    creator.responseHandler(span, responseInfo);
  };
}

/**
 * a map between AWS resource names and their appropriate creator object.
 */
const specificEventCreators = new Map<string, AwsEventCreator>([
  ['SNS', new SNSEventCreator()],
  ['SQS', new SQSEventCreator()],
  ['DynamoDB', new DynamoDBEventCreator()],
]);
