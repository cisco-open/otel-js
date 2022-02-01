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
import { AWSEventCreator } from './event-creator-interface';

export class SQSEventCreator implements AWSEventCreator {
  requestHandler(span: Span, requestInfo: AwsSdkRequestHookInformation): void {
    const queueUrl = requestInfo.request.commandInput.QueueUrl;
    const splited = queueUrl.split('/');
    span.setAttribute('aws.sqs.queue_name', splited.pop());
    span.setAttribute('aws.account_id', splited.pop());
    // span.setAttribute('aws.region', `${requestInfo.request.region}`);

    switch (requestInfo.request.commandName) {
      case 'SendMessage':
        span.setAttribute(
          'aws.sqs.record.message_body',
          requestInfo.request.commandInput.MessageBody
        );
        // span.setAttribute(
        //   'aws.sqs.record.message_attributes',
        //   JSON.stringify(requestInfo.request.commandInput.MessageAttributes)
        // );
        span.setAttribute(
          'aws.sqs.record.delay_seconds',
          requestInfo.request.commandInput.DelaySeconds
        );
        break;
      case 'SendMessageBatch':
        span.setAttribute(
          'aws.sqs.entries',
          JSON.stringify(requestInfo.request.commandInput.Entries)
        );
        break;
      case 'ReceiveMessage':
        // span.setAttribute(
        //   'aws.sqs.record.message_attributes',
        //   requestInfo.request.commandInput.MessageAttributeNames
        // );
        span.setAttribute(
          'aws.sqs.visibility_timeout',
          requestInfo.request.commandInput.VisibilityTimeout
        );
        span.setAttribute(
          'aws.sqs.wait_time_seconds',
          requestInfo.request.commandInput.WaitTimeSeconds
        );
        span.setAttribute(
          'aws.sqs.max_number_of_messages',
          requestInfo.request.commandInput.MaxNumberOfMessages
        );
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
          responseInfo.response.data.MessageId
        );
        break;
      case 'SendMessageBatch':
        span.setAttribute(
          'aws.sqs.record',
          JSON.stringify(responseInfo.response.data)
        );
        break;
      case 'ReceiveMessage': {
        if (responseInfo.response.data.Messages.length == 1) {
          span.setAttribute(
            'aws.sqs.record.message_body',
            responseInfo.response.data.Messages[0].Body
          );
          span.setAttribute(
            'aws.sqs.record.message_attributes',
            JSON.stringify(
              responseInfo.response.data.Messages[0].MessageAttributes
            )
          );
          span.setAttribute(
            'aws.sqs.record.message_id',
            responseInfo.response.data.Messages[0].MessageId
          );
          span.setAttribute(
            'aws.sqs.record.attributes.sender_id',
            responseInfo.response.data.Messages[0].Attributes.SenderId
          );
          span.setAttribute(
            'aws.sqs.record.attributes.sent_timestamp',
            responseInfo.response.data.Messages[0].Attributes.SentTimestamp
          );
          span.setAttribute(
            'aws.sqs.record.attributes.aws_trace_header',
            responseInfo.response.data.Messages[0].Attributes.AWSTraceHeader
          );
        }
        if (responseInfo.response.data.Messages.length > 1) {
          span.setAttribute(
            'aws.sqs.record',
            JSON.stringify(responseInfo.response.data.Messages)
          );
        }
        break;
      }
    }
  }
}
