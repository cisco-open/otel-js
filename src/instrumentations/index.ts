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

import { Options } from '../options';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { configureHttpInstrumentation } from './extentions/http';
import { diag } from '@opentelemetry/api';

export function getInstrumentations(options: Options): Instrumentation[] {
  const instrumentations = getNodeAutoInstrumentations();
  instrumentations.push(new AwsInstrumentation());

  for (const instrumentation of instrumentations) {
    switch (instrumentation.instrumentationName) {
      case '@opentelemetry/instrumentation-http':
        diag.debug('Adding FSO http patching');
        configureHttpInstrumentation(instrumentation, options);
    }
  }
  return instrumentations;
}
