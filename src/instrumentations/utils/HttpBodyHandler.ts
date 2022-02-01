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
import sizeof from 'object-sizeof';

import { Options } from '../../options';

export class HttpBodyHandler {
  private maxPayloadSize: number; // The size in bytes of the maximum payload capturing
  private currentBodySize: number; // The size in bytes of the current stream capture size
  private contentEncoding: string; // The type of the Payload data
  private totalChunks: any[];

  constructor(options: Options, contentEncoding: string) {
    this.maxPayloadSize = options.maxPayloadSize;
    this.currentBodySize = 0;
    this.contentEncoding = contentEncoding;
    this.totalData = string;
  }

  addChunk(chunk: any) {
    if (!chunk) {
      return;
    }
    const chunkSize = sizeof(chunk);
  }
}
