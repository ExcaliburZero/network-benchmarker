const express = require("express");
const app = express();

const PORT = 5023;

const DB_NAME = "NetworkBenchmarker";
const RESULTS_TABLE = "Results";

const DB_URL = "mongodb://localhost/";

const MongoClient = require("mongodb").MongoClient;

function start() {
    console.log("Running server on port: " + PORT);

    MongoClient.connect(DB_URL, function (err, db) {
        const dbo = db.db(DB_NAME);

        console.log("Connected");
        db.close();
    });
}

function getData(req,res) {
    MongoClient.connect(DB_URL, function(err, db) {
        const dbo = db.db(DB_NAME);

        const cursor = dbo.collection(RESULTS_TABLE).find();

        cursor.each(function (err, doc) {
            console.log(doc);
        });

        res.send("Data");
        db.close();
    });
}

app.get("/", (req,res) => res.send("Hello, World!"));
app.get("/data", getData);
app.listen(PORT, start);
