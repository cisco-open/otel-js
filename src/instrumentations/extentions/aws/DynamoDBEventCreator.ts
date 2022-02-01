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

export class DynamoDBEventCreator implements AWSEventCreator {
  requestHandler(span: Span, requestInfo: AwsSdkRequestHookInformation): void {
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
  }
  responseHandler(
    span: Span,
    responseInfo: AwsSdkResponseHookInformation
  ): void {
    switch (responseInfo.response.request.commandName) {
      case 'PutItem':
        span.setAttribute('data', JSON.stringify(responseInfo.response.data));
        break;
    }
  }
}
