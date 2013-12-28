var verify = require('check-types').verify;
var print = require('./print-modules-table');
var getSuccess = require('./stats').getSuccessStats;
var q = require('q');

function report(available, currentVersions) {
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
    var moduleSuccess = {};
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
                        var total = +stats.success + stats.failure;
                        if (total === 0) {
                            moduleSuccess[info.name] = 0;
                        } else {
                            moduleSuccess[info.name] = stats.success / total * 100;
                        }
                        console.log(moduleSuccess);
                    }).fail(function ignore() {});
                });
            }
        }
    });

    return chain.then(function () {
        console.log('success', moduleSuccess);

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
                success: moduleSuccess[info.name]
            });
        });
        console.log('\navailable updates:');
        print(modules);
    });
}

module.exports = report;
