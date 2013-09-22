var colors = require('cli-color');
var check = require('check-types');
var formInstallCommand = require('./report-install-command');

var colorAvailable = process.stdout.isTTY;

function report(updates, useColors) {
    check.verifyArray(updates, 'expected array of updates');

    console.log('\nnext updates:');
    updates.forEach(function (moduleVersions) {
        reportModule(moduleVersions, useColors);
    });

    var cmd = formInstallCommand(updates);
    console.log('Use the following command to install working versions');
    console.log(cmd);
}

function reportModule(moduleVersions, useColors) {
    check.verifyArray(moduleVersions, 'expected module / versions array');
    if (!moduleVersions.length) {
        return;
    }
    useColors = !!useColors && colorAvailable;
    var name = moduleVersions[0].name;
    check.verifyString(name, 'missing module name from ' + JSON.stringify(moduleVersions));
    if (useColors) {
        var colorVersions = moduleVersions.map(function (info) {
            return (info.works ? colors.greenBright : colors.redBright)(info.version);
        });
        var str = colorVersions.join(', ');
        console.log(name + ' ' + str);
    } else {
        console.log(name);
        moduleVersions.forEach(function (info) {
            console.log('  ' + info.version + ' ' + (info.works ? 'PASS' : 'FAIL'));
        });
    }
}

function reportSuccess(text, useColors) {
    if (colorAvailable && useColors) {
        console.log(colors.greenBright(text));
    } else {
        console.log('PASS', text);
    }
}

function reportFailure(text, useColors) {
    if (colorAvailable && useColors) {
        console.log(colors.redBright(text));
    } else {
        console.log('FAIL', text);
    }
}

module.exports = {
    report: report,
    reportSuccess: reportSuccess,
    reportFailure: reportFailure
};