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
    span.setAttribute('aws.sqs.queue_name', splited.pop());
    span.setAttribute('aws.account_id', splited.pop());

    switch (requestInfo.request.commandName) {
      case 'SendMessage': {
        span.setAttribute('aws.sqs.record.message_body', cmdInput.MessageBody);
        span.setAttribute(
          'aws.sqs.record.delay_seconds',
          cmdInput.DelaySeconds
        );
        for (const [key, value] of Object.entries(cmdInput.MessageAttributes)) {
          span.setAttribute(
            `aws.sqs.message_attribute.${key}`,
            JSON.stringify(value)
          );
        }
        break;
      }
      case 'SendMessageBatch': {
        for (const [key, value] of Object.entries(cmdInput.Entries)) {
          span.setAttribute(
            `aws.sqs.request_entry.${key}`,
            JSON.stringify(value)
          );
        }
        break;
      }
      case 'ReceiveMessage':
        span.setAttribute(
          'aws.sqs.visibility_timeout',
          cmdInput.VisibilityTimeout
        );
        span.setAttribute(
          'aws.sqs.wait_time_seconds',
          cmdInput.WaitTimeSeconds
        );
        span.setAttribute(
          'aws.sqs.max_number_of_messages',
          cmdInput.MaxNumberOfMessages
        );
        for (const i in cmdInput.AttributeNames) {
          span.setAttribute(
            `aws.sqs.attribute_name.${i}`,
            JSON.stringify(cmdInput.AttributeNames[i])
          );
        }
        for (const i in cmdInput.MessageAttributeNames) {
          span.setAttribute(
            `aws.sqs.message_attribute_name.${i}`,
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
          'aws.sqs.record.message_id',
          responseInfo.response.data?.MessageId
        );
        break;
      case 'SendMessageBatch': {
        const successMsgList = responseInfo.response.data?.Successful;
        for (const i in successMsgList) {
          span.setAttribute(
            `aws.sqs.result_entry.${i}`,
            JSON.stringify(successMsgList[i])
          );
        }
        const failedMsgList = responseInfo.response.data?.Failed;
        for (const i in failedMsgList) {
          span.setAttribute(
            `aws.sqs.result_error_entry.${i}`,
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
            'aws.sqs.record.message_body',
            data.Messages[0].Body
          );
          const atts = data.Messages[0].Attributes;
          for (const [key, value] of Object.entries(atts)) {
            span.setAttribute(
              `aws.sqs.record.attribute.${key}`,
              JSON.stringify(value)
            );
          }
          const msgAtts = data.Messages[0].MessageAttributes;
          for (const [key, value] of Object.entries(msgAtts)) {
            span.setAttribute(
              `aws.sqs.record.message_attribute.${key}`,
              JSON.stringify(value)
            );
          }
          span.setAttribute(
            'aws.sqs.record.message_id',
            data.Messages[0].MessageId
          );
        }
        if (data.Messages.length > 1) {
          span.setAttribute('aws.sqs.record', JSON.stringify(data.Messages));
        }
        break;
      }
    }
  }
}
