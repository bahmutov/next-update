var colors = require('cli-color');
var check = require('check-types');
var _ = require('lodash');

var colorAvailable = process.stdout.isTTY;

function report(updates) {
    check.verifyArray(updates, 'expected array of updates');

    console.log('next updates:');
    updates.forEach(reportModule);
}

function reportModule(moduleVersions) {
    check.verifyArray(moduleVersions, 'expected module / versions array');
    if (!moduleVersions.length) {
        return;
    }
    var name = moduleVersions[0].name;
    check.verifyString(name, 'missing module name from ' + JSON.stringify(moduleVersions));
    if (colorAvailable) {
        var colorVersions = moduleVersions.map(function (info, index) {
            return (info.works ? colors.greenBright : colors.redBright)(info.version);
        })
        var str = colorVersions.join(', ');
        console.log(name + ' ' + str);
    } else {
        console.log(name);
        moduleVersions.forEach(function (info) {
            console.log('  ' + info.version + ' ' + (info.works ? 'PASS' : 'FAIL'));
        });
    }
}

module.exports = report;