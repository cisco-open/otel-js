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
import { Consts } from 'cisco-opentelemetry-specifications';
import { setInnerOptions } from './inner-options';
export interface Options {
  debug: boolean;
  maxPayloadSize: number;
  payloadsEnabled: boolean;
}

/**
 * Config all OTel & Cisco sdk default instrumentation values.
 * First, take from userOptions/Env variables and at last, set default options if
 * the user didn't specified any.
 * @param options Option received from the User
 */
export function _configDefaultOptions(
  options: Partial<Options>
): Options | undefined {
  options.debug =
    options.debug ||
    getEnvBoolean(Consts.CISCO_DEBUG_ENV, Consts.DEFAULT_CISCO_DEBUG);

  options.maxPayloadSize =
    options.maxPayloadSize ||
    getEnvNumber(
      Consts.CISCO_MAX_PAYLOAD_SIZE_ENV,
      Consts.DEFAULT_MAX_PAYLOAD_SIZE
    );

  options.payloadsEnabled =
    options.payloadsEnabled ||
    getEnvBoolean(
      Consts.CISCO_PAYLOADS_ENABLED_ENV,
      Consts.DEFAULT_PAYLOADS_ENABLED
    );


  setInnerOptions(options);
  return <Options>options;
}

function getEnvBoolean(key: string, defaultValue = true) {
  const value = process.env[key];

  if (value === undefined) {
    return defaultValue;
  }

  return ['false'].indexOf(value.trim().toLowerCase()) < 0;
}

export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];

  if (value === undefined) {
    return defaultValue;
  }

  const numberValue = parseInt(value);

  if (isNaN(numberValue)) {
    return defaultValue;
  }

  return numberValue;
}
