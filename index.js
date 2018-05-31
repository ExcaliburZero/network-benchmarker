const express = require("express")
const app = express()

const PORT = 5023
const DB_NAME = "NetworkBenchmarker"

app.get("/", (req,res) => res.send("Hello, World!"))

function start() {
    console.log("Running server on port: " + PORT)

    var MongoClient = require("mongodb").MongoClient;
    var url = "mongodb://localhost/" + DB_NAME

    MongoClient.connect(url, function (err, db) {
        console.log("Connected");
        db.close();
    });
}

app.listen(PORT, start)
