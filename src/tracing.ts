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
// import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  Resource,
  detectResources,
  processDetector,
  envDetector,
} from '@opentelemetry/resources';
import { getInstrumentations } from './instrumentations';
import { exporterFactory } from './exporter-factory';
// import getVersion from './version';

export async function init(userOptions: Partial<Options>): Promise<void> {
  const options = _configDefaultOptions(userOptions);

  if (!options) {
    diag.error('Cisco default options are not properly configured.');
    return;
  }

  if (options.debug) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const resource = new Resource({
    // TODO: temporarily this is 'application' duo to BC. rename after Cisco is ready
    //[SemanticResourceAttributes.SERVICE_NAME]: options.serviceName,
    ['application']: options.serviceName,
    // ['cisco.sdk.version']: getVersion(),
  });

  const detectorResources = await detectResources({
    detectors: [envDetector, processDetector],
  })
    .then(resources => {
      return resources;
    })
    .catch(reason => diag.error(reason));

  let provider: NodeTracerProvider;

  if (detectorResources) {
    const mergedResources = resource.merge(detectorResources);
    provider = new NodeTracerProvider({ resource: mergedResources });
  } else {
    provider = new NodeTracerProvider({ resource: resource });
  }

  const exporters = exporterFactory(options);
  if (exporters.length === 0) {
    return;
  }
  for (const index in exporters) {
    provider.addSpanProcessor(new BatchSpanProcessor(exporters[index]));
    provider.register();
  }

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: getInstrumentations(options),
  });
}
