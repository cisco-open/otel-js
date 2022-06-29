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
import {
  addAttribute,
  addFlattenedArr,
  addFlattenedObj,
} from '../../utils/utils';

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
    addAttribute(span, SemanticAttributes.AWS_SQS_QUEUE_NAME, splited.pop());
    addAttribute(span, SemanticAttributes.AWS_SQS_ACCOUNT_ID, splited.pop());

    switch (requestInfo.request.commandName) {
      case 'SendMessage': {
        addAttribute(
          span,
          SemanticAttributes.AWS_SQS_RECORD_MESSAGE_BODY,
          cmdInput.MessageBody
        );
        addAttribute(
          span,
          SemanticAttributes.AWS_SQS_RECORD_DELAY_SECONDS,
          cmdInput.DelaySeconds
        );
        addFlattenedArr(
          span,
          SemanticAttributes.AWS_SQS_MESSAGE_ATTRIBUTE,
          cmdInput.MessageAttributes
        );
        break;
      }
      case 'SendMessageBatch': {
        addFlattenedArr(
          span,
          SemanticAttributes.AWS_SQS_REQUEST_ENTRY,
          cmdInput.Entries
        );
        break;
      }
      case 'ReceiveMessage':
        addAttribute(
          span,
          SemanticAttributes.AWS_SQS_VISIBILITY_TIMEOUT,
          cmdInput.VisibilityTimeout
        );
        addAttribute(
          span,
          SemanticAttributes.AWS_SQS_WAIT_TIME_SECONDS,
          cmdInput.WaitTimeSeconds
        );
        addAttribute(
          span,
          SemanticAttributes.AWS_SQS_MAX_NUMBER_OF_MESSAGES,
          cmdInput.MaxNumberOfMessages
        );

        addFlattenedObj(
          span,
          SemanticAttributes.AWS_SQS_ATTRIBUTE_NAME,
          cmdInput.AttributeNames
        );

        addFlattenedObj(
          span,
          SemanticAttributes.AWS_SQS_MESSAGE_ATTRIBUTE_NAME,
          cmdInput.MessageAttributeNames
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
        addAttribute(
          span,
          SemanticAttributes.AWS_SQS_RECORD_MESSAGE_ID,
          responseInfo.response.data?.MessageId
        );
        break;
      case 'SendMessageBatch': {
        addFlattenedArr(
          span,
          SemanticAttributes.AWS_SQS_RESULT_ENTRY,
          responseInfo.response.data?.Successful
        );

        addFlattenedArr(
          span,
          SemanticAttributes.AWS_SQS_RESULT_ERROR_ENTRY,
          responseInfo.response.data?.Failed
        );
        break;
      }

      case 'ReceiveMessage': {
        const data = responseInfo.response.data;
        if (!data) {
          diag.debug('no data attribute in the response');
          return;
        }
        if (data.Messages.length == 1) {
          addAttribute(
            span,
            SemanticAttributes.AWS_SQS_RECORD_MESSAGE_BODY,
            data.Messages[0].Body
          );
          const attrs = data.Messages[0].Attributes;
          addFlattenedArr(
            span,
            SemanticAttributes.AWS_SQS_ATTRIBUTE_NAME,
            attrs
          );
          const msgAttrs = data.Messages[0].MessageAttributes;
          addFlattenedArr(
            span,
            SemanticAttributes.AWS_SQS_MESSAGE_ATTRIBUTE_NAME,
            msgAttrs
          );
          addAttribute(
            span,
            SemanticAttributes.AWS_SQS_RECORD_MESSAGE_ID,
            data.Messages[0].MessageId
          );
        }
        if (data.Messages.length > 1) {
          addAttribute(
            span,
            SemanticAttributes.AWS_SQS_AWS_SQS_RECORD,
            JSON.stringify(data.Messages)
          );
        }
        break;
      }
    }
  }
}
