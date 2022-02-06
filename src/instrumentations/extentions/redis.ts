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

import { RedisInstrumentationConfig } from '@opentelemetry/instrumentation-redis';
import { isSpanContextValid } from '@opentelemetry/api';
import { Span } from '@opentelemetry/api';
import {
  RedisCommand,
  RedisResponseCustomAttributeFunction,
} from '@opentelemetry/instrumentation-redis/build/src/types';

export function configureRedisnstrumentation(
  instrumentation: Instrumentation,
  options: Options
) {
  if (
    typeof instrumentation['getConfig'] !== 'function' ||
    typeof instrumentation['setConfig'] !== 'function'
  ) {
    return;
  }
  let config = instrumentation.getConfig() as RedisInstrumentationConfig;

  if (config === undefined) {
    config = {};
  }

  const responseHook = createRedisResponseHook(options);
  if (config.responseHook === undefined) {
    config.responseHook = responseHook;
  } else {
    const original = config.responseHook;
    config.responseHook = function (
      this: unknown,
      span,
      cmdName,
      cmdArgs,
      response
    ) {
      responseHook(span, cmdName, cmdArgs, response);
      original.call(this, span, cmdName, cmdArgs, response);
    };
  }
  instrumentation.setConfig(config);
}

function createRedisResponseHook(
  options: Options
): RedisResponseCustomAttributeFunction {
  return (
    span: Span,
    cmdName: RedisCommand['command'],
    cmdArgs: RedisCommand['args'],
    responseInfo
  ) => {
    const spanContext = span.spanContext();
    if (!isSpanContextValid(spanContext)) {
      return;
    }
    switch (cmdName) {
      case 'hkeys': {
        span.setAttribute('db.command_arguments', JSON.stringify(cmdArgs));
        span.setAttribute(
          'db.command.response',
          JSON.stringify(responseInfo as Array<String>)
        );
        break;
      }
    }
  };
}
