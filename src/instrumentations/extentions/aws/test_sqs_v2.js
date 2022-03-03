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
// import { Span } from '@opentelemetry/api';
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');
// import * as assert from 'assert';
const {
  AwsInstrumentation,
} = require('@opentelemetry/instrumentation-aws-sdk');
const { configureAwsInstrumentation } = require('./aws_sdk');
const { testOptions } = require('../utils');
// import * as chai from 'chai';

const instrumentation = new AwsInstrumentation();
instrumentation.enable();
const memoryExporter = new InMemorySpanExporter();

const provider = new NodeTracerProvider();
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
instrumentation.setTracerProvider(provider);
instrumentation.enable();
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

instrumentation.disable();
configureAwsInstrumentation(instrumentation, testOptions);
instrumentation.enable();

const params = {
  //  DelaySeconds: 10,
  MessageAttributes: {
    Title: {
      DataType: 'String',
      StringValue: 'The Whistler',
    },
    Author: {
      DataType: 'String',
      StringValue: 'John Grisham',
    },
    WeeksOn: {
      DataType: 'Number',
      StringValue: '6',
    },
  },
  MessageBody:
    'Test in aws v2: Information about current NY Times fiction bestseller for week of 12/11/2016.',
  QueueUrl:
    'https://sqs.us-east-1.amazonaws.com/843855789644/queue-to-test-local-demo',
  // QueueUrl: 'http://localhost:9324',
};

try {
  const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
  sqs.sendMessage(params, (err, data) => {
    if (err) {
      console.log('Error sqs v2', err);
    } else {
      console.log('Success sqs v2', data.MessageId);
    }
  });
  const spans = memoryExporter.getFinishedSpans();
  console.log(spans.length);
} catch (err) {
  console.log('Error: ', err);
}
