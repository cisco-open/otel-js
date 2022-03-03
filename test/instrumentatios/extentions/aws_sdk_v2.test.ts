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

// // IN ORDER TO RUN THIS UNIT_TEST, RUN 'npm run redis'

// import { Span } from '@opentelemetry/api';
// import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
// import {
//   InMemorySpanExporter,
//   SimpleSpanProcessor,
// } from '@opentelemetry/sdk-trace-base';
// import * as assert from 'assert';
// import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
// import { configureAwsInstrumentation } from '../../../src/instrumentations/extentions/aws/aws_sdk';
// import { testOptions } from '../../utils';
// import * as chai from 'chai';

// const instrumentation = new AwsInstrumentation();
// instrumentation.enable();
// const memoryExporter = new InMemorySpanExporter();

// const provider = new NodeTracerProvider();
// const AWS = require('aws-sdk');
// AWS.config.update({ region: 'us-east-1' });
// provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
// instrumentation.setTracerProvider(provider);
// instrumentation.enable();
// import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// describe('Test AWS V2', () => {
//   const RUN_AWS_TESTS = process.env.RUN_AWS_TESTS as string;
//   let shouldTest = true;
//   if (!RUN_AWS_TESTS) {
//     console.log('Skipping test-aws v2');
//     shouldTest = false;
//   }

//   // before(done => {
//   //   if (shouldTest) {
//   //     client = redis.createClient(URL);
//   //     client.on('error', err => {
//   //       done(err);
//   //     });
//   //     client.on('ready', done);
//   //   } else {
//   //     done();
//   //   }
//   // });

//   beforeEach(done => {
//     instrumentation.disable();
//     configureAwsInstrumentation(instrumentation, testOptions);
//     instrumentation.enable();
//     done();
//   });

//   // after(done => {
//   //   if (shouldTest) {
//   //     if (client) {
//   //       client.quit(done);
//   //     } else {
//   //       done();
//   //     }
//   //   } else {
//   //     done();
//   //   }
//   // });

//   // afterEach(done => {
//   //   memoryExporter.reset();
//   //   done();
//   // });

//   describe('Test SQS', () => {
//     const params = {
//       //  DelaySeconds: 10,
//       MessageAttributes: {
//         Title: {
//           DataType: 'String',
//           StringValue: 'The Whistler',
//         },
//         Author: {
//           DataType: 'String',
//           StringValue: 'John Grisham',
//         },
//         WeeksOn: {
//           DataType: 'Number',
//           StringValue: '6',
//         },
//       },
//       MessageBody:
//         'Test in aws v2: Information about current NY Times fiction bestseller for week of 12/11/2016.',
//       QueueUrl:
//         'https://sqs.us-east-1.amazonaws.com/843855789644/queue-to-test-local-demo',
//       // QueueUrl: 'http://localhost:9324',
//       // QueueUrl:
//       //   'https://sqs.us-east-1.amazonaws.com/843855789644/one-element-queue.fifo',
//     };

//     it('Test SQS sendMessage', () => {
//       try {
//         const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
//         sqs.sendMessage(params, (err, data) => {
//           if (err) {
//             console.log('Error sqs v2', err);
//           } else {
//             console.log('Success sqs v2', data.MessageId);
//           }
//         });
//         const spans = memoryExporter.getFinishedSpans();
//         assert.strictEqual(spans.length, 1);
//         // assert.strictEqual(spans[0].attributes['aws.sns.message'], MSG);
//         // chai
//         //   .expect(spans[0].attributes['aws.sns.message_attribute.myKey'])
//         //   .be.an('string');
//       } catch (err) {
//         console.log('Error: ', err);
//       }
//     });
//   });
// });
