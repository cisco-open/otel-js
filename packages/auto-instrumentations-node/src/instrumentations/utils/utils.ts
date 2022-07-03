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
import { Span, Attributes, AttributeValue } from "@opentelemetry/api";
import { PayloadAttributes } from "cisco-opentelemetry-specifications";
import { getInnerOptions } from "../../inner-options";

/** Add Object to Span as flattened labels */
export function addFlattenedObj(span: Span, attrPrefix: string, obj: Object) {
  for (const key in obj) {
    const value = obj[key];

    if (value === undefined) {
      continue;
    }
    const options = getInnerOptions();
    if (!options.payloadsEnabled && PayloadAttributes.has(attrPrefix)) return;
    // we don't call our addAttribute() because it checks again if the key is payload or not
    span.setAttribute(`${attrPrefix}.${key.toLocaleLowerCase()}`, value);
  }
}
/** Add an Array to Span as flattened labels */
export function addFlattenedArr(
  span: Span,
  attrPrefix: string,
  arr: Array<any>
) {
  const options = getInnerOptions();
  if (!options.payloadsEnabled && PayloadAttributes.has(attrPrefix)) return;
  for (const index in arr) {
    // we don't call our addAttribute() because it checks again if the key is payload or not
    span.setAttribute(`${attrPrefix}.${index}`, JSON.stringify(arr[index]));
  }
}

/** Wrapper for native setAttributes */
export function addAttributes(span: Span, attributes: Attributes) {
  for (const att in attributes) {
    addAttribute(span, att, JSON.stringify(attributes[att]));
  }
}

/** Wrapper for native setAttribute */
export function addAttribute(
  span: Span,
  attrPrefix: string,
  value: AttributeValue
) {
  const options = getInnerOptions();
  if (!options.payloadsEnabled && PayloadAttributes.has(attrPrefix)) return;
  span.setAttribute(attrPrefix, value);
}
