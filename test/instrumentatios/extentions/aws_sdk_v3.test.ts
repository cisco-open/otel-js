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
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';

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
  const snsClient = new SNS({ region: 'us-east-1' });

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
});
