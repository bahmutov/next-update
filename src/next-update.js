var check = require('check-types');

var nameVersionParser = require('./moduleName');
var registry = require('./registry');
var nextVersions = registry.nextVersions;
var testVersions = require('./test-module-version').testModulesVersions;
var getDependenciesToCheck = require('./dependencies');
var reportAvailable = require('./report-available');

// returns a promise
function available(moduleName) {
    var toCheck = getDependenciesToCheck(moduleName);
    var nextVersionsPromise = nextVersions(toCheck);
    nextVersionsPromise.then(function (info) {
        reportAvailable(info);
    }, function (error) {
        console.error('Could not fetch available modules\n', error);
    });
}

// returns promise
function checkAllUpdates(options) {
    options = options || {};
    var moduleName = options.names;
    var checkLatestOnly = options.latest;
    var checkCommand = options.testCommand;
    var all = options.all;
    if (all) {
        checkLatestOnly = true;
        console.log('will check only latest versions because testing all');
    }

    if (check.isString(moduleName)) {
        moduleName = [moduleName];
    }
    checkLatestOnly = !!checkLatestOnly;
    if (checkCommand) {
        check.verifyString(checkCommand, 'expected string test command');
    }
    var toCheck = getDependenciesToCheck(moduleName);
    check.verifyArray(toCheck, 'dependencies to check should be an array');

    var testVersionsBound = testVersions.bind(null, {
        modules: toCheck,
        command: checkCommand,
        all: all,
        color: options.color
    });

    if (isSingleSpecificVersion(moduleName)) {
        var nv = nameVersionParser(moduleName[0]);
        console.log('checking only specific:', nv.name, nv.version);
        var list = [{
            name: nv.name,
            versions: [nv.version]
        }];
        return testVersionsBound(list);
    } else {
        var nextVersionsPromise = nextVersions(toCheck, checkLatestOnly);
        return nextVersionsPromise.then(testVersionsBound);
    }
}

function isSingleSpecificVersion(moduleNames) {
    if (!moduleNames) {
        return false;
    }
    var name = moduleNames;
    if (Array.isArray(moduleNames)) {
        if (moduleNames.length !== 1) {
            return false;
        }
        name = moduleNames[0];
    }
    check.verifyString(name, 'expected module name string, not ' +
        JSON.stringify(name));
    var parsed = nameVersionParser(name);
    if (check.isObject(parsed)) {
        return false;
    }
    return check.isString(parsed.version);
}

module.exports = {
    checkAllUpdates: checkAllUpdates,
    available: available
};