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
import {
  addAttribute,
  addFlattenedArr,
  addFlattenedObj,
} from '../../utils/utils';

export class SNSEventCreator implements AwsEventCreator {
  requestHandler(span: Span, requestInfo: AwsSdkRequestHookInformation): void {
    switch (requestInfo.request.commandName) {
      case 'Publish': {
        const cmdInput = requestInfo.request.commandInput;
        // TODO: add sem conv to this
        addAttribute(span, 'aws.sns.message', cmdInput.Message);
        addAttribute(
          span,
          SemanticAttributes.AWS_SNS_MESSAGE_STRUCTURE,
          cmdInput.MessageStructure
        );
        if (cmdInput.MessageAttributes) {
          addFlattenedArr(
            span,
            SemanticAttributes.AWS_SNS_MESSAGE_ATTRIBUTE,
            cmdInput.MessageAttributes
          );
        }
        addAttribute(
          span,
          SemanticAttributes.AWS_SNS_PHONE_NUMBER,
          cmdInput.PhoneNumber
        );
        // TODO: add sem cont to this
        addAttribute(span, 'aws.sns.TargetArn', cmdInput.TargetArn);
        addAttribute(
          span,
          SemanticAttributes.AWS_SNS_TOPIC_ARN,
          cmdInput.TopicArn
        );
        addAttribute(
          span,
          SemanticAttributes.AWS_SNS_SUBJECT,
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
        addAttribute(
          span,
          SemanticAttributes.AWS_SNS_MESSAGE_ID,
          responseInfo.response.data?.MessageId
        );
        break;
    }
  }
}
