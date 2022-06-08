const { ciscoTracing } = require('cisco-telescope');
const api = require('@opentelemetry/api');

api.diag.setLogger(new api.DiagConsoleLogger(), api.DiagLogLevel.ALL);

const userOptions = {
  debug: true,
  serviceName: 'Cisco OTel JS System tests',
  ciscoToken: 'eps_1gNbIHO413YJNF9_ogur6lunYz5EuI17lUpib_2gmb0',
};

ciscoTracing.init(userOptions);
