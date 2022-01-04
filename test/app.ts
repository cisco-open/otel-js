require('../src/tracing.ts')
const express = require("express");

const PORT = process.env.PORT || "8081";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(parseInt(PORT, 10), () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});