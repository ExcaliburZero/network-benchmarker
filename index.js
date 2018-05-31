const express = require("express");
const request = require("request-promise");

const app = express();

const PORT = 5023;
const PUBLIC_DIR = "public";

const DB_NAME = "NetworkBenchmarker";
const RESULTS_TABLE = "Results";

const DB_URL = "mongodb://localhost/";

const MongoClient = require("mongodb").MongoClient;

const REQUEST_URL = "http://www.google.com";
const MEASUREMENT_SAMPLES = 10;
const REQUEST_INTERVAL = 60000; // 1 minute (in ms)

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
    for (i = 0; i < MEASUREMENT_SAMPLES; i++) {
        const elapsed = timeRequest();

        // Divide by 2 to account for both way travel
        const latency = elapsed / 2.0;

        latencySum += latency;
    }

    const meanLatency = latencySum / MEASUREMENT_SAMPLES;

    return meanLatency;
}

function runAndLogBenchmark() {
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
            console.log(result);
        });

        db.close();
    });
}

function start() {
    console.log("Running server on port: " + PORT);

    setInterval(runAndLogBenchmark, REQUEST_INTERVAL);
}

function getData(req,res) {
    MongoClient.connect(DB_URL, function(err, db) {
        if (err) throw err;

        const dbo = db.db(DB_NAME);

        const cursor = dbo.collection(RESULTS_TABLE).find();

        var entries = [];
        cursor.each(function (err, doc) {
            if (err) throw err;

            const receivedAllEntries = doc == null;
            if (receivedAllEntries) {
                res.send(entries);
            } else {
                console.log(doc);

                entries.push(doc);
            }
        });

        db.close();
    });
}

app.use(express.static(PUBLIC_DIR));

app.get("/data", getData);
app.listen(PORT, start);
