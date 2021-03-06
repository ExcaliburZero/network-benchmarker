const request = require("request-promise");

const stats = require("./statistics");

const REQUEST_URL = "http://www.google.com";
const MEASUREMENT_SAMPLES = 10;

const STDDEV_FILTER_RATIO = 2.0; // Allow <= ratio * std deviation from mean

/**
 * Sends a synchronus request to the request url in order to allow for latency
 * to be benchmarked.
 */
async function sendRequest() {
    await request.get(REQUEST_URL);

    return true;
}

/**
 * Returns the current time in a list of seconds and nanoseconds. This is used
 * to calculate the amount of time that a web request takes.
 *
 * It is important to have accuracy in the range of nanoseconds, as opposed to
 * miliseconds, in order to get a good measure of the web request durations,
 * which can be quite small.
 *
 * Note that this function is non-deterministic and performs IO.
 *
 * @example
 * getTime()
 * // [ 7628, 369713115 ]
 */
function getTime() {
    return process.hrtime();
}

/**
 * Returns the difference in time (in nanoseconds) between the given time and
 * the current time.
 *
 * This is used for determining how long a web request takes.
 *
 * @example
 * getTimeDifference([7982, 10950941])
 * // 642933201
 */
function getTimeDifference(prevTime) {
    const timeDifference = process.hrtime(prevTime);

    // Convert the seconds to nanoseconds and add them to the nanoseconds.
    // For this use case there should generally never be any seconds, though.
    const differenceInNano = timeDifference[0] * 1000000 + timeDifference[1];

    return differenceInNano;
}

/**
 * Makes a synchronus web request and returns the time that it took to get a
 * response (in nanoseconds).
 *
 * Note that function uses a web request, so it is non-deterministic, performs
 * IO, and requires an internet connection in order to work properly.
 *
 * @example
 * timeRequest()
 * // 13330469
 */
function timeRequest() {
    const before = getTime();

    const sucessful = sendRequest();

    const difference = getTimeDifference(before);

    return difference;
}

/**
 * Calculate statistics on the given set of benchmark latency measurements.
 *
 * Calculates the mean and standard deviation, before and after filtering out
 * some outliers. Also records how many outliers are filtered out.
 */
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

/**
 * Runs a benchmark of the network and returns statistics from the results.
 *
 * Currently only examines network latency.
 *
 * Note that since this function runs a benchmark using a web request, it is
 * non-deterministic, performs IO, and requires an internet connection in order
 * to work properly.
 *
 * @example
 * benchmark()
 * // { meanLatencyBefore: 97799.85,
 * //   stdLatencyBefore: 53879.88518735447,
 * //   meanLatencyAfter: 82047.83333333333,
 * //   stdLatencyAfter: 27282.63114958754,
 * //   numDroppedPoints: 1 }
 */
function benchmark() {
    // Ignore the first request, as it is often an outlier
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
