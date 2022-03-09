// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var hello_pb = require('./hello_pb.js');

function serialize_helloworld_HelloReply(arg) {
  if (!(arg instanceof hello_pb.HelloReply)) {
    throw new Error('Expected argument of type helloworld.HelloReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_helloworld_HelloReply(buffer_arg) {
  return hello_pb.HelloReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_helloworld_HelloRequest(arg) {
  if (!(arg instanceof hello_pb.HelloRequest)) {
    throw new Error('Expected argument of type helloworld.HelloRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_helloworld_HelloRequest(buffer_arg) {
  return hello_pb.HelloRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


// The greeting service definition.
var GreeterService = exports.GreeterService = {
  // Sends a greeting
sayHello: {
    path: '/helloworld.Greeter/SayHello',
    requestStream: false,
    responseStream: false,
    requestType: hello_pb.HelloRequest,
    responseType: hello_pb.HelloReply,
    requestSerialize: serialize_helloworld_HelloRequest,
    requestDeserialize: deserialize_helloworld_HelloRequest,
    responseSerialize: serialize_helloworld_HelloReply,
    responseDeserialize: deserialize_helloworld_HelloReply,
  },
};

exports.GreeterClient = grpc.makeGenericClientConstructor(GreeterService);
