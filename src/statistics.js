function mean(values) {
    var sum = 0.0;
    for (const v of values) {
        sum += v;
    }

    return sum / values.length;
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
