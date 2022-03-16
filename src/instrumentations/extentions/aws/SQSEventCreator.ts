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
import { diag, Span } from '@opentelemetry/api';
import {
  AwsSdkRequestHookInformation,
  AwsSdkResponseHookInformation,
} from '@opentelemetry/instrumentation-aws-sdk';
import { AwsEventCreator } from './event-creator-interface';
import { SemanticAttributes } from 'cisco-opentelemetry-specifications';

export class SQSEventCreator implements AwsEventCreator {
  requestHandler(span: Span, requestInfo: AwsSdkRequestHookInformation): void {
    const cmdInput = requestInfo.request.commandInput;
    if (!cmdInput || !cmdInput.QueueUrl) {
      diag.debug('No QueueUrl parameter');
      return;
    }
    const splited = cmdInput.QueueUrl.split('/');
    if (!splited) {
      diag.debug('QueueUrl parse failed', cmdInput.QueueUrl);
      return;
    }
    // assuming this structure for QueueUrl:
    // https://sqs.<region>.amazonaws.com/<accountId>/<queueName>
    span.setAttribute(SemanticAttributes.AWS_SQS_QUEUE_NAME.key, splited.pop());
    span.setAttribute(SemanticAttributes.AWS_SQS_ACCOUNT_ID.key, splited.pop());

    switch (requestInfo.request.commandName) {
      case 'SendMessage': {
        span.setAttribute(
          SemanticAttributes.AWS_SQS_RECORD_MESSAGE_BODY.key,
          cmdInput.MessageBody
        );
        span.setAttribute(
          SemanticAttributes.AWS_SQS_RECORD_DELAY_SECONDS.key,
          cmdInput.DelaySeconds
        );
        for (const [key, value] of Object.entries(cmdInput.MessageAttributes)) {
          span.setAttribute(
            `${SemanticAttributes.AWS_SQS_MESSAGE_ATTRIBUTE.key}.${key}`,
            JSON.stringify(value)
          );
        }
        break;
      }
      case 'SendMessageBatch': {
        for (const [key, value] of Object.entries(cmdInput.Entries)) {
          span.setAttribute(
            `${SemanticAttributes.AWS_SQS_REQUEST_ENTRY.key}.${key}`,
            JSON.stringify(value)
          );
        }
        break;
      }
      case 'ReceiveMessage':
        span.setAttribute(
          SemanticAttributes.AWS_SQS_VISIBILITY_TIMEOUT.key,
          cmdInput.VisibilityTimeout
        );
        span.setAttribute(
          SemanticAttributes.AWS_SQS_WAIT_TIME_SECONDS.key,
          cmdInput.WaitTimeSeconds
        );
        span.setAttribute(
          SemanticAttributes.AWS_SQS_MAX_NUMBER_OF_MESSAGES.key,
          cmdInput.MaxNumberOfMessages
        );
        for (const i in cmdInput.AttributeNames) {
          span.setAttribute(
            `${SemanticAttributes.AWS_SQS_ATTRIBUTE_NAME.key}.${i}`,
            JSON.stringify(cmdInput.AttributeNames[i])
          );
        }
        for (const i in cmdInput.MessageAttributeNames) {
          span.setAttribute(
            `${SemanticAttributes.AWS_SQS_MESSAGE_ATTRIBUTE_NAME.key}.${i}`,
            JSON.stringify(cmdInput.MessageAttributeNames[i])
          );
        }
        break;
    }
  }
  responseHandler(
    span: Span,
    responseInfo: AwsSdkResponseHookInformation
  ): void {
    switch (responseInfo.response.request.commandName) {
      case 'SendMessage':
        span.setAttribute(
          SemanticAttributes.AWS_SQS_RECORD_MESSAGE_ID.key,
          responseInfo.response.data?.MessageId
        );
        break;
      case 'SendMessageBatch': {
        const successMsgList = responseInfo.response.data?.Successful;
        for (const i in successMsgList) {
          span.setAttribute(
            `${SemanticAttributes.AWS_SQS_RESULT_ENTRY.key}.${i}`,
            JSON.stringify(successMsgList[i])
          );
        }
        const failedMsgList = responseInfo.response.data?.Failed;
        for (const i in failedMsgList) {
          span.setAttribute(
            `${SemanticAttributes.AWS_SQS_RESULT_ERROR_ENTRY.key}.${i}`,
            JSON.stringify(successMsgList[i])
          );
        }
        break;
      }
      case 'ReceiveMessage': {
        const data = responseInfo.response.data;
        if (!data) {
          diag.debug('no data attribute in the response');
          return;
        }
        if (data.Messages.length == 1) {
          span.setAttribute(
            SemanticAttributes.AWS_SQS_RECORD_MESSAGE_BODY.key,
            data.Messages[0].Body
          );
          const atts = data.Messages[0].Attributes;
          for (const [key, value] of Object.entries(atts)) {
            span.setAttribute(
              `${SemanticAttributes.AWS_SQS_ATTRIBUTE_NAME.key}.${key}`,
              JSON.stringify(value)
            );
          }
          const msgAtts = data.Messages[0].MessageAttributes;
          for (const [key, value] of Object.entries(msgAtts)) {
            span.setAttribute(
              `${SemanticAttributes.AWS_SQS_MESSAGE_ATTRIBUTE_NAME.key}.${key}`,
              JSON.stringify(value)
            );
          }
          span.setAttribute(
            SemanticAttributes.AWS_SQS_RECORD_MESSAGE_ID.key,
            data.Messages[0].MessageId
          );
        }
        if (data.Messages.length > 1) {
          span.setAttribute(
            SemanticAttributes.AWS_SQS_AWS_SQS_RECORD.key,
            JSON.stringify(data.Messages)
          );
        }
        break;
      }
    }
  }
}
