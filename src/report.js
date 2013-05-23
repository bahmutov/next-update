var cli = require('cli-color');
var check = require('check-types');
var _ = require('lodash');

function report(updates) {
    check.verifyArray(updates, 'expected array of updates');

    console.log('next working updates');
    console.dir(updates);
}

module.exports = report;