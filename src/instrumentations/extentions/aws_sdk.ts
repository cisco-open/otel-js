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
  AwsSdkInstrumentationConfig,
  AwsSdkResponseCustomAttributeFunction,
  AwsSdkResponseHookInformation,
  AwsSdkRequestCustomAttributeFunction,
  AwsSdkRequestHookInformation,
} from '@opentelemetry/instrumentation-aws-sdk';
import { isSpanContextValid } from '@opentelemetry/api';
import { Span } from '@opentelemetry/api';

export function configureAWSInstrumentation(
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

  const requestHook = createAWSsdkRequestHook(options);
  if (config.preRequestHook === undefined) {
    config.preRequestHook = requestHook;
  } else {
    const original = config.preRequestHook;
    config.preRequestHook = function (this: unknown, span, request) {
      requestHook(span, request);
      original.call(this, span, request);
    };
  }

  const responseHook = createAWSsdkResponseHook(options);
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

function createAWSsdkRequestHook(
  options: Options
): AwsSdkRequestCustomAttributeFunction {
  return (span: Span, requestInfo: AwsSdkRequestHookInformation) => {
    const spanContext = span.spanContext();
    if (!isSpanContextValid(spanContext)) {
      return;
    }

    const serviceIdentifier = requestInfo.request.serviceName;
    if (!(serviceIdentifier in specificEventCreators)) {
      return;
    }
    specificEventCreators[serviceIdentifier].requestHandler(span, requestInfo);
  };
}

function createAWSsdkResponseHook(
  options: Options
): AwsSdkResponseCustomAttributeFunction {
  return (span: Span, responseInfo: AwsSdkResponseHookInformation) => {
    const spanContext = span.spanContext();
    if (!isSpanContextValid(spanContext)) {
      return;
    }
    const serviceIdentifier = responseInfo.response.request.serviceName;
    if (!(serviceIdentifier in specificEventCreators)) {
      return;
    }
    specificEventCreators[serviceIdentifier].responseHandler(
      span,
      responseInfo
    );
  };
}

const SNSEventCreator = {
  requestHandler(span: Span, requestInfo: AwsSdkRequestHookInformation) {
    switch (requestInfo.request.commandName) {
      case 'Publish':
        span.setAttribute(
          'Notification Message',
          requestInfo.request.commandInput.Message
        );
        span.setAttribute(
          'Notification Message Attributes',
          JSON.stringify(requestInfo.request.commandInput.MessageAttributes)
        );
        break;
    }
  },
  responseHandler(span: Span, responseInfo: AwsSdkResponseHookInformation) {
    switch (responseInfo.response.request.commandName) {
      case 'Publish':
        span.setAttribute('Message ID', responseInfo.response.data.MessageId);
        break;
    }
  },
};

const SQSEventCreator = {
  requestHandler(span: Span, requestInfo: AwsSdkRequestHookInformation) {
    switch (requestInfo.request.commandName) {
      case 'SendMessage':
        span.setAttribute(
          'Message Body',
          requestInfo.request.commandInput.MessageBody
        );
        span.setAttribute(
          'Message Attributes',
          JSON.stringify(requestInfo.request.commandInput.MessageAttributes)
        );
        break;
    }
  },
  responseHandler(span: Span, responseInfo: AwsSdkResponseHookInformation) {
    switch (responseInfo.response.request.commandName) {
      case 'SendMessage':
        span.setAttribute('Message ID', responseInfo.response.data.MessageId);
        span.setAttribute(
          'MD5 Of Message Body',
          responseInfo.response.data.MD5OfMessageBody
        );
        break;
    }
  },
};

const DynamoDBEventCreator = {
  requestHandler(span: Span, requestInfo: AwsSdkRequestHookInformation) {
    switch (requestInfo.request.commandName) {
      case 'PutItem':
        span.setAttribute(
          'Table Name',
          requestInfo.request.commandInput.TableName
        );
        span.setAttribute(
          'Item',
          JSON.stringify(requestInfo.request.commandInput.Item)
        );
        break;
    }
  },
  responseHandler(span: Span, responseInfo: AwsSdkResponseHookInformation) {
    switch (responseInfo.response.request.commandName) {
      case 'PutItem':
        span.setAttribute('data', JSON.stringify(responseInfo.response.data));
        break;
    }
  },
};

/**
 * a map between AWS resource names and their appropriate creator object.
 */
const specificEventCreators = {
  SNS: SNSEventCreator,
  SQS: SQSEventCreator,
  DynamoDB: DynamoDBEventCreator,
};
