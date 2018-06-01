const benchmarks = require("./benchmarks");

const PORT = 5023;

const DB_NAME = "NetworkBenchmarker";
const RESULTS_TABLE = "Results";

const DB_URL = "mongodb://localhost/";

const MongoClient = require("mongodb").MongoClient;

const REQUEST_INTERVAL = 60000; // 1 minute (in ms)

/**
 * Returns the current datetime as a Date object. This is used to keep track of
 * when benchmark results were run.
 */
function getCurrentDatetime() {
    return new Date();
}

/**
 * Runs a benchmark of the network connection and stores the timestamped
 * results into the database.
 */
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

/**
 * Informs the person running the server that the server is running and tells
 * them port the server is running on.
 *
 * Also starts running networking benchmarks at regular intervals to keep track
 * of the network's status over time.
 */
function start() {
    console.log("Running server on port: " + PORT);

    setInterval(runAndLogBenchmark, REQUEST_INTERVAL);
}

/**
 * Returns all of the previous benchmark results by grabbing them from the
 * database.
 *
 * Returns a list of all of the benchmark result objects. Returns an empty list
 * if no benchmark results are recorded in the database.
 *
 * This is used to allow the visualization to get the benchmark results.
 */
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

/**
 * Clears all of the benchmark results from the database.
 *
 * This is used to clear out old results when the benchmarking method is being
 * changed or tested by a developer.
 */
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
