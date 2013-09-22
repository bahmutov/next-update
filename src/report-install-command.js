var check = require('check-types');

function installCommand(updates) {
    check.verifyArray(updates, 'expected array of updates');
    if (!updates.length) {
        return;
    }

    var cmd = 'npm install --save';
    updates.forEach(function (moduleVersions) {
        var latestWorkingVersion = getLatestWorkingVersion(moduleVersions);
        if (latestWorkingVersion) {
            cmd += ' ' + latestWorkingVersion.name + '@' + latestWorkingVersion.version;
        }
    });

    if ((/--save$/).test(cmd)) {
        return;
    }

    return cmd;
}

function getLatestWorkingVersion(versions) {
    check.verifyArray(versions, 'expected array of versions');
    var working;
    versions.forEach(function (info) {
        if (info.works) {
            working = info;
        }
    });

    return working;
}

module.exports = installCommand;