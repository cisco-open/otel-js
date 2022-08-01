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
import { Options } from '../../options';
import type * as graphqlTypes from 'graphql';

import { GraphQLInstrumentationConfig } from '@opentelemetry/instrumentation-graphql';
// TODO: import straight from graphql instrumentation once our PR will approved
import { GraphQLInstrumentationExecutionResponseHook } from '@opentelemetry/instrumentation-graphql/build/src/types';
import { isSpanContextValid } from '@opentelemetry/api';

export function configureGrpahQLnstrumentation(
  instrumentation: Instrumentation,
  options: Options
) {
  if (
    typeof instrumentation['setConfig'] !== 'function' ||
    typeof instrumentation['getConfig'] !== 'function'
  ) {
    return;
  }
  let config = instrumentation.getConfig() as GraphQLInstrumentationConfig;

  if (config === undefined) {
    config = {};
  }

  const responseHook = createHttpResponseHook(options);

  if (config.responseHook === undefined) {
    config.responseHook = responseHook;
  } else {
    const original = config.responseHook;
    config.responseHook = function (this: unknown, span, response) {
      responseHook(span, response);
      original.call(this, span, response);
    };
  }

  instrumentation.setConfig(config);
}

function createHttpResponseHook(
  options: Options
): GraphQLInstrumentationExecutionResponseHook {
  return (span, data: graphqlTypes.ExecutionResult) => {
    const spanContext = span.spanContext();

    if (!isSpanContextValid(spanContext)) {
      return;
    }

    console.log(data.data);
  };
}
