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
import * as grpc from '@grpc/grpc-js';

import { HelloRequest, HelloReply } from './generated_proto/hello_pb';
import { GreeterService } from './generated_proto/hello_grpc_pb';
import { RESPONSE_MESSAGE, RESPONSE_METADATA } from './consts';

const sayHello = (
  call: grpc.ServerUnaryCall<HelloRequest, HelloReply>,
  callback: grpc.sendUnaryData<HelloReply>
): void => {
  const reply = new HelloReply();
  call.sendMetadata(RESPONSE_METADATA);
  reply.setMessage(RESPONSE_MESSAGE);
  callback(null, reply);
};

export const server = new grpc.Server();
server.addService(GreeterService, { sayHello });
