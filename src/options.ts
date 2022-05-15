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
import { diag } from '@opentelemetry/api';
import { Consts } from 'cisco-opentelemetry-specifications';
import { setInnerOptions } from './inner-options';
export interface Options {
  serviceName: string;
  ciscoToken: string;
  debug: boolean;
  maxPayloadSize: number;
  payloadsEnabled: boolean;
  exporters: ExporterOptions[];
}

export interface ExporterOptions {
  type?: string;
  collectorEndpoint: string;
  customHeaders?: {};
}

/**
 * Config all OTel & Cisco sdk default values.
 * First, take from userOptions/Env variables and at last, set default options if
 * the user didn't specified any.
 * @param options Option received from the User
 */
export function _configDefaultOptions(
  options: Partial<Options>
): Options | undefined {
  options.ciscoToken =
    options.ciscoToken || process.env[Consts.CISCO_TOKEN_ENV] || '';

  if (!options.ciscoToken && !options.exporters) {
    diag.error('Cisco token must be passed into initialization');
    return undefined;
  }

  if (options.ciscoToken && options.exporters) {
    diag.warn(
      'Custom exporters do not use cisco token, it can be passed as a custom header'
    );
  }

  options.serviceName =
    options.serviceName ||
    process.env.OTEL_SERVICE_NAME ||
    Consts.DEFAULT_SERVICE_NAME;

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

  options.exporters =
    options.exporters &&
    options.exporters[0].collectorEndpoint &&
    options.exporters[0].type
      ? options.exporters
      : [
          <ExporterOptions>{
            type:
              process.env[Consts.OTEL_EXPORTER_TYPE_ENV] ||
              Consts.DEFAULT_EXPORTER_TYPE,
            collectorEndpoint:
              process.env[Consts.OTEL_COLLECTOR_ENDPOINT] ||
              Consts.DEFAULT_COLLECTOR_ENDPOINT,
            customHeaders: {
              [Consts.TOKEN_HEADER_KEY]: verify_token(options.ciscoToken),
            },
          },
        ];

  setInnerOptions(options);
  return <Options>options;
}

function verify_token(token: string): string {
  if (token.startsWith('Bearer')) {
    diag.info(
      'Bearer was manually specified as part of the ciscoToken and recommended not to (Works either way).'
    );
    return token;
  } else {
    return `Bearer ${token}`;
  }
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
