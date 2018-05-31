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

function standardDeviation(values, mean) {
    var std = 0.0;
    for (const v of values) {
        const diff = v - mean;

        std += Math.pow(diff, 2.0);
    }

    std = Math.sqrt(std / values.length);

    return std;
}

function benchmark() {
    // Ignore the first request
    timeRequest();

    var latencySum = 0.0;
    const latencies = [];
    for (i = 0; i < MEASUREMENT_SAMPLES; i++) {
        const elapsed = timeRequest();

        // Divide by 2 to account for both way travel
        const latency = elapsed / 2.0;

        latencies.push(latency);
        latencySum += latency;
    }

    const meanLatency = latencySum / MEASUREMENT_SAMPLES;

    const stdLatency = standardDeviation(latencies, meanLatency);

    return {
        "meanLatency": meanLatency,
        "stdLatency": stdLatency
    };
}

function runAndLogBenchmark() {
    MongoClient.connect(DB_URL, function (err, db) {
        if (err) throw err;

        const result = benchmark();

        const dbo = db.db(DB_NAME);

        result.datetime = getCurrentDatetime();

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

function getData(req, res) {
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
                entries.push(doc);
            }
        });

        db.close();
    });
}

function clearData(req, res) {
    MongoClient.connect(DB_URL, function(err, db) {
        if (err) throw err;

        const dbo = db.db(DB_NAME);

        const cursor = dbo.collection(RESULTS_TABLE).deleteMany();

        db.close();
        res.send("Data cleared");
    });
}

app.use(express.static(PUBLIC_DIR));

app.get("/data", getData);
app.get("/clear_data", clearData);
app.listen(PORT, start);
