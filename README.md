# otel-js
Launcher for OpenTelemetry Node.js


Currently uses otel only.

To test the launcher:
1. verify you have docker installed and use the config.yaml in this repository to run the collector:
Note: you should supply full path in -v argument:
docker run --rm -p 13133:13133 -p 14250:14250 -p 14268:14268 \
      -p 55678-55679:55678-55679 -p 4317:4317 -p 8888:8888 -p 9411:9411 \
              -v "${HOME}/YOUR_PATH/otel-js/test/config.yaml":/otel-local-config.yaml \
      --name otelcol otel/opentelemetry-collector \
      --config otel-local-config.yaml;
2. compile from the root: tsc -p .
3. run from the root: node build/test/app.js
3. go to http://localhost:8081/ and verify you see "Hello World"
4. check the collector, you should see a trace there.