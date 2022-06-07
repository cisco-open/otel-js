'use strict';

require('http');
const express = require('express');

// Constants
const PORT = 7080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.status(200).send('Hallo Worldz');
});

app.listen(PORT, () => console.log(`Running on http://${HOST}:${PORT}`));
