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
import { addAttribute } from './utils';

export class PayloadHandler {
  private maxPayloadSize: number; // The size in bytes of the maximum payload capturing
  private currentBodySize: number; // The size in bytes of the current stream capture size
  // TODO: maybe add content encoding parsing in the future
  private totalChunks: any[];
  private isBufferString: boolean;

  constructor(options: Options, contentEncoding?: string) {
    this.maxPayloadSize = options.maxPayloadSize;
    this.currentBodySize = 0;
    this.totalChunks = [];
    this.isBufferString = false;
  }

  addChunk(chunk: any) {
    if (!chunk) {
      return;
    }
    try {
      this.isBufferString = typeof chunk === 'string';

      const chunkSize = chunk.length;
      if (this.currentBodySize + chunkSize <= this.maxPayloadSize) {
        this.totalChunks.push(chunk);
      } else {
        this.totalChunks.push(chunk.slice(0, this.maxPayloadSize - chunkSize));
      }
    } catch (error) {
      diag.warn(`Could not add chunk ${chunk}, An error occurred: ${error}`);
    }
  }

  setPayload(span: Span, attrPrefix: string) {
    if (this.isBufferString) {
      const body = this.totalChunks.join('');
      PayloadHandler.addPayloadToSpan(span, attrPrefix, body);
    } else {
      try {
        const buf = Buffer.concat(this.totalChunks);
        PayloadHandler.addPayloadToSpan(span, attrPrefix, buf);
      } catch (error) {
        diag.warn(
          `Could not concat the chunk array: ${this.totalChunks}, An error occurred: ${error}`
        );
      }
    }
  }

  static setPayload(
    span: Span,
    attrPrefix: string,
    payload: any,
    maxPayloadSize: number
  ) {
    if (!payload) {
      return;
    }
    if (payload.length > maxPayloadSize) {
      PayloadHandler.addPayloadToSpan(
        span,
        attrPrefix,
        payload.slice(0, maxPayloadSize - payload.length)
      );
    } else {
      PayloadHandler.addPayloadToSpan(span, attrPrefix, payload);
    }
  }

  private static addPayloadToSpan(span: Span, attrPrefix: string, chunk: any) {
    try {
      addAttribute(span, attrPrefix, chunk.toString());
    } catch (e) {
      diag.debug('Failed to parse the payload data');
      return;
    }
  }
}
