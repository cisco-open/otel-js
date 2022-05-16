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
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { _configDefaultOptions, Options } from './options';
import {
  Resource,
  detectResources,
  processDetector,
  envDetector,
} from '@opentelemetry/resources';
import { getInstrumentations } from './instrumentations';
import { exporterFactory } from './exporter-factory';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export async function init(userOptions: Partial<Options>) {
  const options = _configDefaultOptions(userOptions);

  if (!options) {
    diag.error('Cisco default options are not properly configured.');
    return;
  }

  if (options.debug) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const exporters = exporterFactory(options);
  if (exporters.length === 0) {
    return;
  }

  registerInstrumentations({
    instrumentations: getInstrumentations(options),
  });

  const detectedResources = await detectResources({
    detectors: [envDetector, processDetector],
  });

  const ciscoResource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: options.serviceName,
  });

  const provider = new NodeTracerProvider({
    resource: ciscoResource.merge(detectedResources),
  });

  for (const index in exporters) {
    provider.addSpanProcessor(new BatchSpanProcessor(exporters[index]));
  }

  provider.register();
  diag.info('cisco-telescope agent is up!');
}
