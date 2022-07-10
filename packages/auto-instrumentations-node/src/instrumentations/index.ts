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

import {
  getNodeAutoInstrumentations,
  InstrumentationConfigMap,
} from '@opentelemetry/auto-instrumentations-node';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { diag } from '@opentelemetry/api';
import { configureHttpInstrumentation } from './extentions/http';
import { configureAmqplibInstrumentation } from './extentions/amqplib';
import { configureAwsInstrumentation } from './extentions/aws/aws_sdk';
import { configureRedisInstrumentation } from './extentions/redis';
import {
  GrpcJsInstrumentation,
  GrpcInstrumentationConfig,
} from './static-instrumentations/grpc-js';
import { MongoDBInstrumentationConfig } from '@opentelemetry/instrumentation-mongodb';
import { _configDefaultOptions, Options } from '../options';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';

// TODO: fillout the options
export function getCiscoNodeAutoInstrumentations(
  configMap: InstrumentationConfigMap = {},
  userOptions: Partial<Options>
): Instrumentation[] {
  // Extra Cisco config
  const ciscoConfigMap = {
    '@opentelemetry/instrumentation-aws-lambda': { enabled: false },
    '@opentelemetry/instrumentation-grpc': { enabled: false },
  };
  const mergedConfig = Object.assign({}, configMap, ciscoConfigMap);
  const instrumentations = getNodeAutoInstrumentations(mergedConfig);
  // TODO: once we have package per instrumentation, we will have to remove this
  //       because we will want to give the user option to config every instrumentation by itself.
  const options = _configDefaultOptions(userOptions);
  instrumentations.push(new AwsInstrumentation());

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
      case '@opentelemetry/instrumentation-mongodb':
        if (options.payloadsEnabled) {
          diag.debug('Adding Payloads to mongodb');
          const userConfig =
            instrumentation.getConfig() as MongoDBInstrumentationConfig;
          if (!userConfig.enhancedDatabaseReporting === undefined) {
            userConfig.enhancedDatabaseReporting = true;
            instrumentation.setConfig(userConfig);
          }
        }
        break;
      case '@opentelemetry/instrumentation-grpc':
        instrumentations.push(
          getCiscoGrpcJSInstrumentation(
            instrumentation as GrpcInstrumentation,
            options
          )
        );
        break;
    }
  }
  return instrumentations;
}

/**
 * replace the Grpc JS instrumentation with cisco telescope instrumentation and
 * copy the config from the OTel to the Telescope one.
 */
function getCiscoGrpcJSInstrumentation(
  origGrpcInstrumentation: GrpcInstrumentation,
  options: Options
): GrpcJsInstrumentation {
  const grpcInstrumentationConfig =
    origGrpcInstrumentation.getConfig() as GrpcInstrumentationConfig;
  grpcInstrumentationConfig.maxPayloadSize = options.maxPayloadSize;
  grpcInstrumentationConfig.payloadsEnabled = options.payloadsEnabled;
  grpcInstrumentationConfig.enabled = true;
  diag.debug('Adding Cisco grpc-js instrumentation');
  return new GrpcJsInstrumentation(
    'cisco-grpc-instrumentation',
    grpcInstrumentationConfig
  );
}
