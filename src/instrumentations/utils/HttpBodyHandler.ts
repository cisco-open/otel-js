/*
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

import { Options } from '../../options';
import { diag, Span } from '@opentelemetry/api';

export class HttpBodyHandler {
  private maxPayloadSize: number; // The size in bytes of the maximum payload capturing
  private currentBodySize: number; // The size in bytes of the current stream capture size
  // TODO: maybe add content parsing in the future
  private totalChunks: any[];

  constructor(options: Options, contentEncoding: string) {
    this.maxPayloadSize = options.maxPayloadSize
      ? options.maxPayloadSize
      : 1024;
    this.currentBodySize = 0;
    this.totalChunks = [];
  }

  addChunk(chunk: any) {
    if (!chunk) {
      return;
    }
    const chunkSize = chunk.length;
    if (this.currentBodySize + chunkSize <= this.maxPayloadSize) {
      this.totalChunks.push(chunk);
    } else {
      this.totalChunks.push(chunk.slice(0, this.maxPayloadSize - chunkSize));
    }
  }

  setPayload(span: Span, bodyType: string) {
    try {
      span.setAttribute(
        `http.${bodyType}.body`,
        Buffer.concat(this.totalChunks).toString()
      );
    } catch (e) {
      diag.debug('Failed to parse the HTTP body data');
      return;
    }
  }
}
