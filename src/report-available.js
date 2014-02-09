var verify = require('check-types').verify;
var print = require('./print-modules-table');
var stats = require('./stats');
var clc = require('cli-color');
var getSuccess = stats.getSuccessStats;
var q = require('q');

function report(available, currentVersions, options) {
    verify.array(available, 'expect an array of info objects');
    if (!available.length) {
        console.log('nothing new is available');
        return;
    }
    if (currentVersions) {
        verify.object(currentVersions, 'expected current versions object ' +
            JSON.stringify(currentVersions, null, 2));
    }

    var chain = q();
    var updateStats = {};
    available.forEach(function (info) {
        verify.string(info.name, 'missing module name ' + info);
        verify.array(info.versions, 'missing module versions ' + info);
        if (info.versions.length === 1) {
            var currentVersion = currentVersions[info.name];
            if (currentVersion) {
                chain = chain.then(function () {
                    return getSuccess({
                        name: info.name,
                        from: currentVersion,
                        to: info.versions[0]
                    }).then(function (stats) {
                        updateStats[info.name] = stats;
                    }).fail(function ignore() {});
                });
            }
        }
    });

    return chain.then(function () {
        var modules = [];

        available.forEach(function (info) {
            verify.string(info.name, 'missing module name ' + info);
            verify.array(info.versions, 'missing module versions ' + info);
            var sep = ', ';
            if (info.versions.length > 5) {
                sep = '\n  ';
            }
            var versions = info.versions.join(sep);
            modules.push({
                name: info.name,
                version: versions,
                stats: updateStats[info.name]
            });
        });
        console.log('\navailable updates:');
        print(modules, options);
        console.log('update stats from', clc.underline(stats.url));
    });
}

module.exports = report;
