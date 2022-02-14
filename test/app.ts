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
import { fso, Options } from '../src';
import { ExporterOptions } from '../src/options';

const exporterOptions: ExporterOptions = {
  FSOEndpoint: 'http://localhost:4317',
};

const userOptions: Options = {
  serviceName: 'my-app-name',
  FSOToken: 'sometoken',
  exporters: [exporterOptions],
};

fso.init(userOptions);

const express = require('express');

const PORT = process.env.PORT || '8081';
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/shalom', (req, res) => {
  res.send('Shalom World!');
});

app.get('/shalom', (req, res) => {
  res.send('Shalom World!');
});

app.listen(parseInt(PORT, 10), () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
