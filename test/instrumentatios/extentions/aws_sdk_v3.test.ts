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

import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import * as assert from 'assert';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { configureAwsInstrumentation } from '../../../src/instrumentations/extentions/aws/aws_sdk';
import { testOptions } from '../../utils';
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
chai.use(require('chai-as-promised'));

const instrumentation = new AwsInstrumentation();
instrumentation.enable();
const memoryExporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider();
const { SNS } = require('@aws-sdk/client-sns');
const { SQS } = require('@aws-sdk/client-sqs');
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
instrumentation.setTracerProvider(provider);

describe('Test AWS V3', () => {
  const RUN_AWS_TESTS = process.env.RUN_AWS_TESTS as string;
  let shouldTest = true;
  if (!RUN_AWS_TESTS) {
    console.log('Skipping test-aws v3');
    shouldTest = false;
  }
  const ACCOUNT_ID = '0000000';

  beforeEach(function shouldSkip(this: any, done) {
    if (!shouldTest) {
      this.skip();
    }
    done();
    console.log('call done in beforeEadh');
  });

  afterEach(done => {
    if (!shouldTest) {
      done();
      console.log('call done in afterEach in case we shoule NOT test');
    } else {
      memoryExporter.reset();
      done();
      console.log('call done in afterEach in case we shoule test');
    }
  });

  describe('Test SNS requestHandler attributes', () => {
    const MSG = 'MESSAGE_TEXT_FOR_TEST';
    const TOPIC = `arn:aws:sns:us-east-1:${ACCOUNT_ID}}:non-existing-topic`;
    const SUBJECT = 'mySubject';
    before(() => {
      instrumentation.disable();
      configureAwsInstrumentation(instrumentation, testOptions);
      instrumentation.enable();
    });

    it('Test SNS publish', done => {
      const params = {
        Message: MSG,
        TopicArn: TOPIC,
        Subject: SUBJECT,
        PhoneNumber: '+972000000000',
        MessageAttributes: {
          myKey: {
            DataType: 'String',
            StringValue: 'somestringvalue',
          },
        },
      };
      const snsClient = new SNS({ region: 'us-east-1' });
      const promise = snsClient.publish(params);
      promise
        .then(data => {
          console.log('success sns publish - should not happen!');
        })
        .catch(err => {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assert.strictEqual(spans[0].attributes['aws.sns.message'], MSG);
          chai
            .expect(spans[0].attributes['aws.sns.message_attribute.myKey'])
            .be.an('string');
          assert.strictEqual(
            spans[0].attributes['aws.sns.PhoneNumber'],
            '+972000000000'
          );
          assert.strictEqual(spans[0].attributes['aws.sns.TopicArn'], TOPIC);
          assert.strictEqual(spans[0].attributes['aws.sns.subject'], SUBJECT);
        });
      promise.should.be.rejected.and.notify(done());
    });
  });

  describe('Test SQS requestHandler attributes', () => {
    const QUEUE_NAME = 'non-existing-queue';
    const QUEUE_URL = `https://sqs.us-east-1.amazonaws.com/${ACCOUNT_ID}}/${QUEUE_NAME}}`;

    async function test(params) {
      const sqsClient = new SQS({ region: 'us-east-1' });
      sqsClient.receiveMessage(params, (err, data) => {
        if (err) {
          console.log('inside error');
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
        } else {
          console.log('inside success');
        }
      });
    }

    async function testReceiveMessage(params) {
      const sqsClient = new SQS({ region: 'us-east-1' });
      const promise = sqsClient.receiveMessage(params);
      promise
        .then(data => {
          assert.equal(1, 0);
        })
        .catch(err => {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assert.strictEqual(
            spans[0].attributes['aws.sqs.queue_name'],
            QUEUE_NAME
          );
          assert.strictEqual(spans[0].attributes['aws.account_id'], ACCOUNT_ID);
          assert.strictEqual(
            spans[0].attributes['aws.sqs.visibility_timeout'],
            20
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.wait_time_seconds'],
            0
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.max_number_of_messages'],
            10
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.attribute_name.0'],
            'SentTimestamp'
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.attribute_name.1'],
            'SenderId'
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.message_attribute_name.0'],
            'All'
          );
        });
    }

    before(() => {
      instrumentation.disable();
      configureAwsInstrumentation(instrumentation, testOptions);
      instrumentation.enable();
    });

    it('Test SQS sendMessage', done => {
      const params = {
        DelaySeconds: 10,
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
        MessageBody: 'Test in aws v3: This is the message body.',
        QueueUrl: QUEUE_URL,
      };
      const sqsClient = new SQS({ region: 'us-east-1' });
      const promise = sqsClient.sendMessage(params);
      promise
        .then(data => {
          console.log('success sqs sendMessage - should not happen!');
        })
        .catch(err => {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assert.strictEqual(
            spans[0].attributes['aws.sqs.queue_name'],
            QUEUE_NAME
          );
          assert.strictEqual(spans[0].attributes['aws.account_id'], ACCOUNT_ID);
          assert.strictEqual(
            spans[0].attributes['aws.sqs.record.message_body'],
            'Test in aws v3: This is the message body.'
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.record.delay_seconds'],
            10
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.message_attribute.Author'],
            '{"DataType":"String","StringValue":"John Grisham"}'
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.message_attribute.Title'],
            '{"DataType":"String","StringValue":"The Whistler"}'
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.message_attribute.WeeksOn'],
            '{"DataType":"Number","StringValue":"6"}'
          );
        });
      promise.should.be.rejected.and.notify(done());
    });

    it('Test SQS sendMessageBatch', done => {
      const params = {
        QueueUrl: QUEUE_URL,
        Entries: [
          {
            Id: '1000',
            MessageBody: 'msg body for 1000',
          },
          {
            Id: '1001',
            MessageBody: 'msg body for 1001',
          },
        ],
      };
      const sqsClient = new SQS({ region: 'us-east-1' });
      const promise = sqsClient.sendMessageBatch(params);
      promise
        .then(data => {
          console.log('success sqs sendMessageBatch - should not happen!');
        })
        .catch(err => {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assert.strictEqual(
            spans[0].attributes['aws.sqs.queue_name'],
            QUEUE_NAME
          );
          assert.strictEqual(spans[0].attributes['aws.account_id'], ACCOUNT_ID);
          assert.strictEqual(
            spans[0].attributes['aws.sqs.request_entry.0'],
            '{"Id":"1000","MessageBody":"msg body for 1000"}'
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.request_entry.1'],
            '{"Id":"1001","MessageBody":"msg body for 1001"}'
          );
        });
      promise.should.be.rejected.and.notify(done());
    });

    xit('Test SQS receiveMessage', done => {
      const params = {
        AttributeNames: ['SentTimestamp', 'SenderId'],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: ['All'],
        QueueUrl: QUEUE_URL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0,
      };
      const sqsClient = new SQS({ region: 'us-east-1' });
      const promise = sqsClient.receiveMessage(params);
      promise
        .then(data => {
          assert.equal(1, 0);
        })
        .catch(err => {
          console.log('here 0.5');
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assert.strictEqual(
            spans[0].attributes['aws.sqs.queue_name'],
            QUEUE_NAME
          );
          assert.strictEqual(spans[0].attributes['aws.account_id'], ACCOUNT_ID);
          assert.strictEqual(
            spans[0].attributes['aws.sqs.visibility_timeout'],
            20
          );
          console.log('here 1');
          assert.strictEqual(
            spans[0].attributes['aws.sqs.wait_time_seconds'],
            0
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.max_number_of_messages'],
            10
          );
          console.log('here 2');
          assert.strictEqual(
            spans[0].attributes['aws.sqs.attribute_name.0'],
            'SentTimestamp'
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.attribute_name.1'],
            'SenderId'
          );
          console.log('here 3');
          assert.strictEqual(
            spans[0].attributes['aws.sqs.message_attribute_name.0'],
            'All'
          );
        });
      // promise.should.be.rejected.and.notify(done);
    });

    it('Test SQS receiveMessage', async () => {
      const params = {
        AttributeNames: ['SentTimestamp', 'SenderId'],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: ['All'],
        QueueUrl: QUEUE_URL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0,
      };
      await testReceiveMessage(params);
    });
  });
});
