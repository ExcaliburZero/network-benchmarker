const express = require("express");
const app = express();

const PORT = 5023;

const DB_NAME = "NetworkBenchmarker";
const RESULTS_TABLE = "Results";

const DB_URL = "mongodb://localhost/";

const MongoClient = require("mongodb").MongoClient;

function getCurrentDatetime() {
    return new Date();
}

function start() {
    console.log("Running server on port: " + PORT);

    MongoClient.connect(DB_URL, function (err, db) {
        if (err) throw err;

        const dbo = db.db(DB_NAME);

        const result = {
            datetime: getCurrentDatetime(),
            mean_latency: 5.0
        };

        dbo.collection(RESULTS_TABLE).insertOne(result, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
        });

        console.log("Connected");
        db.close();
    });
}

function getData(req,res) {
    MongoClient.connect(DB_URL, function(err, db) {
        if (err) throw err;

        const dbo = db.db(DB_NAME);

        const cursor = dbo.collection(RESULTS_TABLE).find();

        cursor.each(function (err, doc) {
            if (err) throw err;
            console.log(doc);
        });

        res.send("Data");
        db.close();
    });
}

app.get("/", (req,res) => res.send("Hello, World!"));
app.get("/data", getData);
app.listen(PORT, start);
