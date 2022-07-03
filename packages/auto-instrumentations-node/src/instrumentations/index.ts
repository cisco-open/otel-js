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
import { Instrumentation } from '@opentelemetry/instrumentation';

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { diag } from '@opentelemetry/api';
import { configureHttpInstrumentation } from './extentions/http';
import { configureAmqplibInstrumentation } from './extentions/amqplib';
import { configureAwsInstrumentation } from './extentions/aws/aws_sdk';
import { configureRedisInstrumentation } from './extentions/redis';
import { GrpcJsInstrumentation } from './static-instrumentations/grpc-js/instrumentation';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { Options } from '../options';

// TODO: fillout the options
export function getInstrumentations(options: Options): Instrumentation[] {
  const instrumentations = getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-aws-lambda': { enabled: false },
    '@opentelemetry/instrumentation-grpc': { enabled: false },
    '@opentelemetry/instrumentation-mongodb': { enabled: false },
  });

  instrumentations.push(new AwsInstrumentation());

  //TODO: add options
  if (options.payloadsEnabled) {
    diag.debug('Adding Payloads to mongodb');
    // TODO: if we support user instrumentation this will override the user default config
    instrumentations.push(
      new MongoDBInstrumentation({ enhancedDatabaseReporting: true })
    );
  }

  diag.debug('Adding Cisco grpc-js instrumentation');
  instrumentations.push(
    new GrpcJsInstrumentation('cisco-opentelemetry-instrumentation-grpc', {
      maxPayloadSize: options.maxPayloadSize,
    })
  );

  for (const instrumentation of instrumentations) {
    switch (instrumentation.instrumentationName) {
      case '@opentelemetry/instrumentation-http':
        diag.debug('Adding Cisco http patching');
        configureHttpInstrumentation(instrumentation, options);
        break;
      case '@opentelemetry/instrumentation-aws-sdk':
        diag.debug('Adding Cisco aws-sdk patching');
        configureAwsInstrumentation(instrumentation, options);
        break;
      case '@opentelemetry/instrumentation-redis':
        diag.debug('Adding Cisco redis patching');
        configureRedisInstrumentation(instrumentation, options);
        break;
      case '@opentelemetry/instrumentation-amqplib':
        diag.debug('Adding Cisco amqplib patching');
        configureAmqplibInstrumentation(instrumentation, options);
        break;
    }
  }
  return instrumentations;
}
