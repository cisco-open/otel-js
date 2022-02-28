const express = require('express');
const bodyParser = require('body-parser');

// Constants
const PORT = 11337;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  console.log(req)
  res.status(200).send('Hallo Worldz');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
