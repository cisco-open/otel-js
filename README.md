# otel-js
This package provides a Launcher for OpenTelemetry Node.js

## Usage
```javascript
import { fso, Options } from '../src';

const userOptions: Options = {
  FSOEndpoint: 'http://localhost:4317',
  serviceName: 'my-app-name',
  FSOToken: 'sometoken',
};
fso.init(userOptions);
```

## Configuration

Advanced options can be configured as a parameter to the init() method:

|Parameter          |Type   |Default                  |Description          |
|-------------------|-------|-------------------------|---------------------|
|FSOEndpoint        |String | `http://localhost:4713` | The address of the trace collector to send traces to |
|serviceName        |String | `application`           | Application name that will be set for traces         |
|FSOToken           |String | -                       | Epsagon account token                                |

To test the launcher:

1. verify you have docker installed and use the config.yaml in this repository to run the collector:
      Note: you should supply full path in -v argument:

      ```javascript
      docker run --rm -p 13133:13133 -p 14250:14250 -p 14268:14268 \
            -p 55678-55679:55678-55679 -p 4317:4317 -p 8888:8888 -p 9411:9411 \
                  -v "${HOME}/YOUR_PATH/otel-js/test/config.yaml":/otel-local-config.yaml \
            --name otelcol otel/opentelemetry-collector \
            --config otel-local-config.yaml;
      ```

2. Build from the root:

      ```sh
      npm run build
      ```

3. Run from the root:

      ```sh
      node build/test/app.js
      ```

4. Go to <http://localhost:8081/> and verify you see "Hello World"
5. Check the collector, you should see a trace there.
