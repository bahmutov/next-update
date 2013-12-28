var verify = require('check-types').verify;
var request = require('request');
var Q = require('q');
var colors = require('cli-color');
var colorAvailable = process.stdout.isTTY;

var nextUpdateStatsUrl = require('../package.json')['next-update-stats'] ||
    'http://next-update.herokuapp.com';

function sendUpdateResult(options) {
    verify.unemptyString(options.name, 'missing name');
    verify.unemptyString(options.from, 'missing from version');
    verify.unemptyString(options.to, 'missing to version');
    if (options.success) {
        options.success = !!options.success;
    }

    verify.webUrl(nextUpdateStatsUrl, 'missing next update stats server url');
    var sendOptions = {
        uri: nextUpdateStatsUrl + '/update',
        method: 'POST',
        json: options
    };
    request(sendOptions, function ignoreResponse() {});
}

function getSuccessStats(options) {
    verify.unemptyString(options.name, 'missing name');
    verify.unemptyString(options.from, 'missing from version');
    verify.unemptyString(options.to, 'missing to version');

    verify.webUrl(nextUpdateStatsUrl, 'missing next update stats server url');
    var opts = {
        uri: nextUpdateStatsUrl + '/package/' + options.name + '/' + options.from +
            '/' + options.to,
        method: 'GET',
        json: options
    };
    var defer = Q.defer();
    request(opts, function (err, response, stats) {
        if (err || response.statusCode !== 200) {
            console.error('could not get success stats for', options.name);
            console.error(opts);
            console.error(err || response.statusCode);
            defer.reject(err);
            return;
        }
        defer.resolve(stats);
    });
    return defer.promise;
}

function colorProbability(options, probability) {
    options = options || {};
    var useColors = !!options.color && colorAvailable;
    var probabilityStr = probability + '%';
    if (useColors) {
        if (probability > 80) {
            probabilityStr = colors.greenBright(probabilityStr);
        } else if (probability > 50) {
            probabilityStr = colors.yellowBright(probabilityStr);
        } else {
            probabilityStr = colors.redBright(probabilityStr);
        }
    }
    return probabilityStr;
}

function printStats(options, stats) {
    verify.object(stats, 'missing stats object');
    verify.unemptyString(stats.name, 'missing name');
    verify.unemptyString(stats.from, 'missing from version');
    verify.unemptyString(stats.to, 'missing to version');
    stats.success = +stats.success || 0;
    stats.failure = +stats.failure || 0;
    var total = stats.success + stats.failure;
    var probability = (total > 0 ? stats.success / total * 100: 0).toFixed(0);
    var probabilityStr = colorProbability(options, probability);
    console.log('stats:', stats.name, stats.from, '->', stats.to,
        'success probability', probabilityStr,
        stats.success, 'success(es)', stats.failure, 'failure(s)');
}

module.exports = {
    sendUpdateResult: sendUpdateResult,
    getSuccessStats: getSuccessStats,
    printStats: printStats
};
