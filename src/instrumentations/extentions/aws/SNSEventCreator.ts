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
import { Span } from '@opentelemetry/api';
import {
  AwsSdkRequestHookInformation,
  AwsSdkResponseHookInformation,
} from '@opentelemetry/instrumentation-aws-sdk';
import { AwsEventCreator } from './event-creator-interface';
import { SemanticAttributes } from 'cisco-opentelemetry-specifications';

export class SNSEventCreator implements AwsEventCreator {
  requestHandler(span: Span, requestInfo: AwsSdkRequestHookInformation): void {
    switch (requestInfo.request.commandName) {
      case 'Publish': {
        const cmdInput = requestInfo.request.commandInput;
        // TODO: add sem conv to this
        span.setAttribute('aws.sns.message', cmdInput.Message);
        span.setAttribute(
          SemanticAttributes.AWS_SNS_MESSAGE_STRUCTURE.key,
          cmdInput.MessageStructure
        );
        if (cmdInput.MessageAttributes) {
          for (const [key, value] of Object.entries(
            cmdInput.MessageAttributes
          )) {
            span.setAttribute(
              `${SemanticAttributes.AWS_SNS_MESSAGE_ATTRIBUTE.key}.${key}`,
              JSON.stringify(value)
            );
          }
        }
        span.setAttribute(
          SemanticAttributes.AWS_SNS_PHONE_NUMBER.key,
          cmdInput.PhoneNumber
        );
        // TODO: add sem cont to this
        span.setAttribute('aws.sns.TargetArn', cmdInput.TargetArn);
        span.setAttribute(
          SemanticAttributes.AWS_SNS_TOPIC_ARN.key,
          cmdInput.TopicArn
        );
        span.setAttribute(
          SemanticAttributes.AWS_SNS_SUBJECT.key,
          cmdInput.Subject
        );
        break;
      }
    }
  }
  responseHandler(
    span: Span,
    responseInfo: AwsSdkResponseHookInformation
  ): void {
    switch (responseInfo.response.request.commandName) {
      case 'Publish':
        span.setAttribute(
          SemanticAttributes.AWS_SNS_MESSAGE_ID.key,
          responseInfo.response.data?.MessageId
        );
        break;
    }
  }
}
