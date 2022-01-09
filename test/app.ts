import {epsagon} from '../src';

epsagon.init({
  appName: 'my-app-name',
  token: 'sometoken',
  collectorURL: 'http://localhost:4317'
})

const express = require("express");

const PORT = process.env.PORT || "8081";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(parseInt(PORT, 10), () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});