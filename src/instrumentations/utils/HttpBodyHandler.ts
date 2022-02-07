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
  // @ts-ignore
  private contentEncoding: string; // The type of the Payload data
  private totalChunks: any[];

  constructor(options: Options, contentEncoding: string) {
    this.maxPayloadSize = options.maxPayloadSize
      ? options.maxPayloadSize
      : 1024;
    this.currentBodySize = 0;
    this.totalChunks = [];
    this.contentEncoding = contentEncoding;
  }

  addChunk(chunk: any) {
    if (!chunk) {
      return;
    }
    const chunkSize = chunk.length;
    if (this.currentBodySize + chunkSize <= this.maxPayloadSize) {
      this.totalChunks.push(chunk);
    } else {
    }
  }

  setPayload(span: Span, bodyType: string) {
    try {
      const parsedBody = JSON.parse(Buffer.concat(this.totalChunks).toString());
      console.log(parsedBody);
      for (const bodyKey in parsedBody) {
        const bodyValue = parsedBody[bodyKey];

        if (bodyValue === undefined) {
          continue;
        }

        span.setAttribute(
          `http.${bodyType}.body.${bodyKey.toLocaleLowerCase()}`,
          bodyValue
        );
      }
    } catch (e) {
      diag.debug('Failed to parse the HTTP body data');
      return;
    }
  }
}
