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

export interface Options {
  serviceName: string;
  FSOToken: string;
  debug?: boolean;
  maxPayloadSize?: number;
  exporters?: ExporterOptions[];
}

export interface ExporterOptions {
  type?: string;
  FSOEndpoint: string;
}
/**
 * Config all OTel & FSO default values.
 * First, take from userOptions/Env variables and at last, set default options if
 * the user didn't specified any.
 * @param options Option received from the User
 */
export function _configDefaultOptions(options: Options): Options | undefined {
  options.FSOToken = options.FSOToken || process.env.FSO_TOKEN || '';

  if (!options.FSOToken) {
    diag.error('FSO token must be passed into initialization');
    return undefined;
  }

  options.serviceName =
    options.serviceName || process.env.SERVICE_NAME || 'application';

  options.debug = options.debug || getEnvBoolean('FSO_DEBUG', false);

  options.maxPayloadSize =
    options.maxPayloadSize || getEnvNumber('MAX_PAYLOAD_SIZE', 1024);

  options.exporters = options.exporters &&
    options.exporters[0].FSOEndpoint &&
    options.exporters[0].type
      ? options.exporters
      : [
          <ExporterOptions>{
            type: process.env.EXPORTER_TYPE || 'otlp-grpc',
            FSOEndpoint: process.env.FSO_ENDPOINT || 'http://localhost:4713',
          },
        ];

  return options;
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
