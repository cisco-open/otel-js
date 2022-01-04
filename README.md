# otel-js
Launcher for OpenTelemetry Node.js


Currently uses otel only.

To test the launcher:
1. use docker and run: docker run --rm -p 13133:13133 -p 14250:14250 -p 14268:14268 \
      -p 55678-55679:55678-55679 -p 4317:4317 -p 8888:8888 -p 9411:9411 \
              -v "${HOME}/YOUR_PATH/otel-js/test/config.yaml":/otel-local-config.yaml \
      --name otelcol otel/opentelemetry-collector \
      --config otel-local-config.yaml;
2. run from the root: node test/app.ts
3. go to http://localhost:8081/ and verify you see "Hello World"
4. check the collector, you should see a trace there.