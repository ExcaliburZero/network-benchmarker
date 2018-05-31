const express = require("express");
const request = require("request-promise");

const app = express();

const PORT = 5023;

const DB_NAME = "NetworkBenchmarker";
const RESULTS_TABLE = "Results";

const DB_URL = "mongodb://localhost/";

const MongoClient = require("mongodb").MongoClient;

const REQUEST_URL = "http://www.google.com";

const NUM_REQUESTS = 10;

async function sendRequest() {
    await request.get(REQUEST_URL);

    return true;
}

function getCurrentDatetime() {
    return new Date();
}

function getTimeNano() {
    return process.hrtime()[1];
}

function timeRequest() {
    const before = getTimeNano();

    const sucessful = sendRequest();

    const after = getTimeNano();
    const difference = after - before;

    return difference;
}

function benchmarkMeanLatency() {
    // Ignore the first request
    timeRequest();

    var latencySum = 0.0;
    for (i = 0; i < NUM_REQUESTS; i++) {
        const elapsed = timeRequest();

        // Divide by 2 to account for both way travel
        const latency = elapsed / 2.0;

        latencySum += latency;
    }

    const meanLatency = latencySum / NUM_REQUESTS;

    return meanLatency;
}

function start() {
    console.log("Running server on port: " + PORT);

    MongoClient.connect(DB_URL, function (err, db) {
        if (err) throw err;

        const meanLatency = benchmarkMeanLatency();

        const dbo = db.db(DB_NAME);

        const result = {
            datetime: getCurrentDatetime(),
            mean_latency: meanLatency
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
