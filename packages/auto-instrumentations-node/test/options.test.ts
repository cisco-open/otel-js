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
import { Options, _configDefaultOptions } from '../src/options';
import * as utils from './utils';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as api from '@opentelemetry/api';
import { Consts } from 'cisco-opentelemetry-specifications';

describe('Options tests', () => {
  let logger;

  beforeEach(() => {
    utils.cleanEnvironmentVariables();

    logger = {
      info: sinon.spy(),
      warn: sinon.spy(),
      error: sinon.spy(),
    };

    api.diag.setLogger(logger, api.DiagLogLevel.ALL);
    // Setting logger logs stuff. Cleaning that up.
    logger.warn.resetHistory();
  });

  afterEach(() => {
    api.diag.disable();
  });

  describe('default configuration', () => {
    it('should config all default variables properly', () => {
      const options = _configDefaultOptions(<Options>{});
      assert.ok(options);
      assert.deepStrictEqual(options, <Options>{
        maxPayloadSize: Consts.DEFAULT_MAX_PAYLOAD_SIZE,
        payloadsEnabled: Consts.DEFAULT_PAYLOADS_ENABLED,
      });
      sinon.assert.neverCalledWith(logger.error);
    });
  });

  describe('user Options configuration', () => {
    it('should assign properly the user default configuration and not override', () => {
      const userOptions = <Options>{
        maxPayloadSize: 10000,
        payloadsEnabled: true,
      };
      const options = _configDefaultOptions(userOptions);
      assert.ok(options);
      assert.deepStrictEqual(options, userOptions);
      sinon.assert.neverCalledWith(logger.error);
    });
  });

  describe('user Options Env vars configuration', () => {
    it('should assign properly the user default configuration and not override', () => {
      const userOptions = <Options>{
        maxPayloadSize: 10000,
        payloadsEnabled: true,
      };

      process.env.CISCO_PAYLOADS_ENABLED = String(userOptions.payloadsEnabled);
      process.env.CISCO_MAX_PAYLOAD_SIZE = String(userOptions.maxPayloadSize);

      const options = _configDefaultOptions(<Options>{});
      assert.ok(options);
      assert.deepStrictEqual(options, userOptions);
      sinon.assert.neverCalledWith(logger.error);
      sinon.assert.neverCalledWith(logger.warn);
    });
  });
});
