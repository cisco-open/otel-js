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
const instrumentation = new AwsInstrumentation();
instrumentation.enable();
const memoryExporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider();
import { SNS, PublishCommandOutput } from '@aws-sdk/client-sns';
import { SQS, SendMessageBatchCommandOutput } from '@aws-sdk/client-sqs';

import * as nock from 'nock';
import * as fs from 'fs';
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));
instrumentation.setTracerProvider(provider);

const region = 'us-east-1';

describe('Test AWS V3 with nock', () => {
  const RUN_AWS_TESTS = process.env.RUN_AWS_TESTS as string;
  let shouldTest = true;
  if (!RUN_AWS_TESTS) {
    console.log('Skipping test-aws v3.run: export RUN_AWS_TESTS=1 to run them');
    shouldTest = false;
  }

  beforeEach(function shouldSkip(this: any, done) {
    if (!shouldTest) {
      this.skip();
    }
    done();
  });

  afterEach(done => {
    if (!shouldTest) {
      done();
    } else {
      memoryExporter.reset();
      done();
    }
  });

  describe('Test SNS using nock', () => {
    const snsClient = new SNS({
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'abcde',
        secretAccessKey: 'abcde',
      },
    });
    const params = {
      Message: 'MESSAGE_TEXT_FOR_TEST',
      TopicArn: 'arn:aws:sns:us-east-1:000000000:dummy-topic',
      Subject: 'mysubject',
      PhoneNumber: '+972000000000',
      MessageAttributes: {
        myKey: {
          DataType: 'String',
          StringValue: 'somestringvalue',
        },
      },
    };
    before(() => {
      instrumentation.disable();
      configureAwsInstrumentation(instrumentation, testOptions);
      instrumentation.enable();
    });

    it('sns publish promise await', async () => {
      nock(`https://sns.${region}.amazonaws.com/`)
        .post('/')
        .reply(
          200,
          fs.readFileSync(
            `${__dirname}/aws-mock-responses/sns-publish.xml`,
            'utf8'
          )
        );
      await snsClient.publish(params);
      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 1);
      assert.strictEqual(
        spans[0].attributes['aws.sns.message'],
        'MESSAGE_TEXT_FOR_TEST'
      );
      chai
        .expect(spans[0].attributes['aws.sns.message_attribute.myKey'])
        .be.an('string');
      assert.strictEqual(
        spans[0].attributes['aws.sns.PhoneNumber'],
        '+972000000000'
      );
      assert.strictEqual(
        spans[0].attributes['aws.sns.TopicArn'],
        'arn:aws:sns:us-east-1:000000000:dummy-topic'
      );
      assert.strictEqual(spans[0].attributes['aws.sns.subject'], 'mysubject');
      assert.strictEqual(
        spans[0].attributes['aws.sns.message_id'],
        '90d1987b-4853-54ad-a499-c2d89c4edf3a' //taken from the mock response in sns-publish.xml
      );
    });

    it('sns publish callback interface', done => {
      nock(`https://sns.${region}.amazonaws.com/`)
        .post('/')
        .reply(
          200,
          fs.readFileSync(
            `${__dirname}/aws-mock-responses/sns-publish.xml`,
            'utf8'
          )
        );
      snsClient.publish(params, (err: any, data?: PublishCommandOutput) => {
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 1);
        assert.strictEqual(
          spans[0].attributes['aws.sns.message'],
          'MESSAGE_TEXT_FOR_TEST'
        );
        chai
          .expect(spans[0].attributes['aws.sns.message_attribute.myKey'])
          .be.an('string');
        assert.strictEqual(
          spans[0].attributes['aws.sns.PhoneNumber'],
          '+972000000000'
        );
        assert.strictEqual(
          spans[0].attributes['aws.sns.TopicArn'],
          'arn:aws:sns:us-east-1:000000000:dummy-topic'
        );
        assert.strictEqual(spans[0].attributes['aws.sns.subject'], 'mysubject');
        assert.strictEqual(
          spans[0].attributes['aws.sns.message_id'],
          '90d1987b-4853-54ad-a499-c2d89c4edf3a' //taken from the mock response in sns-publish.xml
        );
        done();
      });
    });
  });

  describe('Test SQS using nock', () => {
    const sqsClient = new SQS({
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'abcde',
        secretAccessKey: 'abcde',
      },
    });

    before(() => {
      instrumentation.disable();
      configureAwsInstrumentation(instrumentation, testOptions);
      instrumentation.enable();
    });

    it('sqs sendMessage promise await', async () => {
      nock(`https://sqs.${region}.amazonaws.com/`)
        .post('/')
        .reply(
          200,
          fs.readFileSync(
            `${__dirname}/aws-mock-responses/sqs-send-message.xml`,
            'utf8'
          )
        );
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
        MessageBody: 'Test sqs: This is the message body.',
        QueueUrl: 'queue/dummy-account/testing',
      };

      await sqsClient.sendMessage(params);
      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 1);
      assert.strictEqual(spans[0].attributes['aws.sqs.queue_name'], 'testing');
      assert.strictEqual(
        spans[0].attributes['aws.account_id'],
        'dummy-account'
      );
      assert.strictEqual(
        spans[0].attributes['aws.sqs.record.message_body'],
        'Test sqs: This is the message body.'
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
      assert.strictEqual(
        spans[0].attributes['aws.sqs.record.message_id'],
        '35de59a8-cdcc-4f55-9734-d73434058622' // taken from the mock response in sqs-send-message.xml
      );
    });

    it('sqs sendMessageBatch callback interface', done => {
      nock(`https://sqs.${region}.amazonaws.com/`)
        .post('/')
        .reply(
          200,
          fs.readFileSync(
            `${__dirname}/aws-mock-responses/sqs-send-message-batch.xml`,
            'utf8'
          )
        );
      const params = {
        QueueUrl: 'queue/dummy-account/testing',
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
      sqsClient.sendMessageBatch(
        params,
        (err: any, data?: SendMessageBatchCommandOutput) => {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 1);
          assert.strictEqual(
            spans[0].attributes['aws.sqs.queue_name'],
            'testing'
          );
          assert.strictEqual(
            spans[0].attributes['aws.account_id'],
            'dummy-account'
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.request_entry.0'],
            '{"Id":"1000","MessageBody":"msg body for 1000"}'
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.request_entry.1'],
            '{"Id":"1001","MessageBody":"msg body for 1001"}'
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.result_entry.0'],
            '{"Id":"1000","MessageId":"57f7be0d-22a2-42f4-a9d9-3a136fbb219d","MD5OfMessageBody":"c1fa3d847ec219eeb524250e0498b614"}'
          );
          assert.strictEqual(
            spans[0].attributes['aws.sqs.result_entry.1'],
            '{"Id":"1001","MessageId":"fee3d5ba-32f1-48b9-a4bc-8a6ef6d4457c","MD5OfMessageBody":"3e83b83eef8cece2b95bfc8b9501da0a"}'
          );
          done();
        }
      );
    });
  });
});
