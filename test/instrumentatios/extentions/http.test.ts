import * as utils from '../../utils';

import { HttpInstrumentation} from "@opentelemetry/instrumentation-http";
import { configureHttpInstrumentation } from "../../../src/instrumentatios/extentions/http";
import {Options} from "../../../src";
import {diag, DiagConsoleLogger, DiagLogLevel} from "@opentelemetry/api";
import {BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor} from "@opentelemetry/sdk-trace-base";
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const instrumentation = new HttpInstrumentation();
instrumentation.enable();
instrumentation.disable();

const memoryExporter = new InMemorySpanExporter();
const provider = new BasicTracerProvider();
instrumentation.setTracerProvider(provider);
const tracer = provider.getTracer('test-https');
provider.addSpanProcessor(new SimpleSpanProcessor(memoryExporter));

const PORT = 11337;
const SERVER_URL = `http://localhost:${PORT}`;


describe('Capturing HTTP Headers/Bodies', () => {
    let http;
    let server;
    let options = <Options>{
        FSOToken: 'some-token',
        FSOEndpoint: 'http://localhost:4713',
        serviceName: 'application',
    };

    before(() => {
        instrumentation.enable()
    })

    before(() => {
        instrumentation.disable()
    })

    beforeEach(() => {
        memoryExporter.reset();
        configureHttpInstrumentation(instrumentation, options)
        utils.cleanEnvironmentVariables();
    });

    afterEach(() => {
        server.close();
    });

    const setupServer = () => {
        http = require('http');
        server = http.createServer((req, res) => {
            console.log('here')
            res.end('ok');
        });
        server.listen(PORT);
        console.log('Server is up')
    };

    it('test sanity - unstable', done => {
        setupServer();

        const requestOptions =  {
            content: JSON.stringify({ 'impuestos': [1, 2] }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Test-Header': 'Some Header',
            }
        }

        const span = tracer.startSpan('updateRootSpan');
        http.get(SERVER_URL, requestOptions, res => {
            span.end()
            memoryExporter.getFinishedSpans();
            done();
        })
    });
});
