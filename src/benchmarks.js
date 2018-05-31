const request = require("request-promise");

const REQUEST_URL = "http://www.google.com";
const MEASUREMENT_SAMPLES = 10;

async function sendRequest() {
    await request.get(REQUEST_URL);

    return true;
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

exports.benchmark = benchmark;
