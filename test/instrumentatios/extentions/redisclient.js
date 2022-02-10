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
const { createClient } = require('redis');
const { diag } = require('@opentelemetry/api');
const express = require('express');
const PORT = process.env.PORT || '8081';
const app = express();

// app.get('/', (req, res) => {
async function residFUnc () {
    const client = createClient();
    client.flushdb();
    client.on('error', err => console.log('Redis Client Error', err));
    await client.hset('myhash', 'key1', 'value1', () => {
      console.log('the redis set callback for key1');
    });
    await client.hset('myhash', 'key2', 'value2', () => {
      console.log('the redis set callback for key2');
    });
    const data = await client.hgetall('myhash', (data) => {
      console.log(data);
    });
    client.quit();
    // res.status(200).send('ok');
  };
// });
residFUnc();
// app.listen(parseInt(PORT, 10), () => {
//   console.log(`Listening for requests on http://localhost:${PORT}`);
// });
