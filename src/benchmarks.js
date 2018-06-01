const request = require("request-promise");

const stats = require("./statistics");

const REQUEST_URL = "http://www.google.com";
const MEASUREMENT_SAMPLES = 10;

const STDDEV_FILTER_RATIO = 2.0; // Allow <= ratio * std deviation from mean

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

function calculateStatistics(latencies) {
    const meanLatency = stats.mean(latencies);
    const stdLatency = stats.standardDeviation(latencies, meanLatency);

    const filteredLatencies = stats.filterByStdFromMean(latencies, meanLatency, stdLatency, STDDEV_FILTER_RATIO);

    const meanLatencyAfter = stats.mean(filteredLatencies);
    const stdLatencyAfter = stats.standardDeviation(filteredLatencies, meanLatencyAfter);

    const numDroppedPoints = latencies.length - filteredLatencies.length;

    return {
        "meanLatencyBefore": meanLatency,
        "stdLatencyBefore": stdLatency,
        "meanLatencyAfter": meanLatencyAfter,
        "stdLatencyAfter": stdLatencyAfter,
        "numDroppedPoints": numDroppedPoints
    };
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

    return calculateStatistics(latencies);
}

exports.benchmark = benchmark;
