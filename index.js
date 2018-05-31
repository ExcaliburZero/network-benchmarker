const express = require("express");

const app = express();

const PUBLIC_DIR = "public";

const endpoints = require("./src/endpoints");

app.use(express.static(PUBLIC_DIR));

app.get("/data", endpoints.getData);
app.get("/clear_data", endpoints.clearData);
app.listen(endpoints.PORT, endpoints.start);
