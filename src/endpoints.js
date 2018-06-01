const benchmarks = require("./benchmarks");

const PORT = 5023;

const DB_NAME = "NetworkBenchmarker";
const RESULTS_TABLE = "Results";

const DB_URL = "mongodb://localhost/";

const MongoClient = require("mongodb").MongoClient;

const REQUEST_INTERVAL = 60000; // 1 minute (in ms)

function getCurrentDatetime() {
    return new Date();
}

function runAndLogBenchmark() {
    MongoClient.connect(DB_URL, function (err, db) {
        if (err) throw err;

        const result = benchmarks.benchmark();

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
                db.close();
            } else {
                entries.push(doc);
            }
        });
    });
}

function clearData(req, res) {
    MongoClient.connect(DB_URL, function(err, db) {
        if (err) throw err;

        const dbo = db.db(DB_NAME);

        dbo.collection(RESULTS_TABLE).deleteMany();

        db.close();
        res.send("Data cleared");
    });
}

exports.start = start;
exports.getData = getData;
exports.clearData = clearData;
exports.PORT = PORT;
