/**
 * Returns the mean of the given list of numerical values.
 *
 * Does not mutate the given list.
 *
 * @example
 * mean([1.0, 2.5, 3.0, 4.0])
 * // 2.625
 */
function mean(values) {
    var sum = 0.0;
    for (const v of values) {
        sum += v;
    }

    return sum / values.length;
}

/**
 * Returns the standard deviation of the given list of numerical values, using
 * the given mean value of the list.
 *
 * Does not mutate the given list.
 *
 * @example
 * standardDeviation([1.0, 2.5, 3.0, 4.0], 2.625)
 * // 1.0825317547305484
 */
function standardDeviation(values, mean) {
    var std = 0.0;
    for (const v of values) {
        const diff = v - mean;

        std += Math.pow(diff, 2.0);
    }

    std = Math.sqrt(std / values.length);

    return std;
}

/**
 * Returns a version of the given list of values where all values that deviate
 * from the mean by greater than the standard deviation multiplied by the given
 * filterRatio.
 *
 * This is used to remove outliers from a sample of measurements.
 *
 * Does not mutate the given list, and instead returns a new list that is a
 * subset of the given list. 
 *
 * @example
 * filterByStdFromMean([1.0, 2.0, 3.0, 4.0, 5.0], 3, 1.4142135623730951, 1.0)
 * // [2.0, 3.0, 4.0]
 */
function filterByStdFromMean(values, mean, std, filterRatio) {
    const allowedDeviation = std * filterRatio;

    const filteredValues = [];
    for (const v of values) {
        const diffFromMean = Math.abs(v - mean);
        if (diffFromMean <= allowedDeviation) {
            filteredValues.push(v);
        }
    }

    return filteredValues;
}

exports.mean = mean;
exports.standardDeviation = standardDeviation;
exports.filterByStdFromMean = filterByStdFromMean;
