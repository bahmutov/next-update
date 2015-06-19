var colors = require('cli-color');
var check = require('check-types');
var formInstallCommand = require('./report-install-command');
var _ = require('lodash');

var colorAvailable = process.stdout.isTTY;

function report(updates, useColors, keptUpdates) {
    check.verify.array(updates, 'expected array of updates');

    console.log('\n> next updates:');
    updates.forEach(function (moduleVersions) {
        reportModule(moduleVersions, useColors);
    });

    var cmd = formInstallCommand(updates);
    if (_.isUndefined(cmd)) {
        console.log('> nothing can be updated :(');
    } else {
        if (keptUpdates) {
            console.log('> kept working updates');
        } else {
            cmd = cmd.trim();
            var lines = cmd.split('\n').length;
            if (lines === 1) {
                console.log('> use the following command to install working versions');
            } else {
                console.log('> use the following commands to install working versions');
            }
            console.log(cmd);
        }
    }
}

function reportModule(moduleVersions, useColors) {
    check.verify.array(moduleVersions, 'expected module / versions array');
    if (!moduleVersions.length) {
        return;
    }
    useColors = !!useColors && colorAvailable;
    var name = moduleVersions[0].name;
    check.verify.unemptyString(name, 'missing module name from ' + JSON.stringify(moduleVersions));
    var fromVersion = moduleVersions[0].from;
    check.verify.unemptyString(fromVersion, 'missing from version from ' + JSON.stringify(moduleVersions));

    if (useColors) {
        var colorVersions = moduleVersions.map(function (info) {
            return (info.works ? colors.greenBright : colors.redBright)(info.version);
        });
        var str = colorVersions.join(', ');
        console.log(name + ' ' + fromVersion + ' -> ' + str);
    } else {
        console.log(name + '@' + fromVersion);
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
