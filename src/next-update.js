var Q = require('q');
Q.longStackSupport = true;
var check = require('check-types');
var verify = check.verify;
var depsOk = require('deps-ok');
var _ = require('lodash');

var nameVersionParser = require('./moduleName');
var registry = require('./registry');
var nextVersions = registry.nextVersions;
var testVersions = require('./test-module-version').testModulesVersions;
var runTest = require('./test-module-version').testPromise;
var getDependenciesToCheck = require('./dependencies');
var reportAvailable = require('./report-available');

// returns a promise
function available(moduleName, options) {
    var toCheck = getDependenciesToCheck(moduleName);
    var nextVersionsPromise = nextVersions(toCheck);
    nextVersionsPromise.then(function (info) {
        toCheck = _.zipObject(toCheck);
        return reportAvailable(info, toCheck, options);
    }, function (error) {
        console.error('Could not fetch available modules\n', error);
    });
}

function checkDependenciesInstalled() {
    var defer = Q.defer();
    process.nextTick(function () {
        if (depsOk(process.cwd())) {
            defer.resolve();
        } else {
            var msg = 'Current installation is invalid, please run NPM install first';
            defer.reject(new Error(msg));
        }
    });
    return defer.promise;
}

function checkCurrentInstall(options) {
    console.log('checking if the current state works');
    return checkDependenciesInstalled()
    .then(function () {
        return runTest(options && options.testCommand)();
    })
    .then(function () {
        console.log('current state works');
    });
}

// returns promise
function checkAllUpdates(options) {
    options = options || {};
    var moduleName = options.names;
    var checkLatestOnly = !!options.latest;
    var checkCommand = options.testCommand;
    if (checkCommand) {
        verify.unemptyString(checkCommand, 'invalid test command ' + checkCommand);
    }
    var all = options.all;
    if (all) {
        checkLatestOnly = true;
        console.log('will check only latest versions because testing all');
    }

    if (check.string(moduleName)) {
        moduleName = [moduleName];
    }
    checkLatestOnly = !!checkLatestOnly;
    if (checkCommand) {
        check.verify.string(checkCommand, 'expected string test command');
    }
    var toCheck = getDependenciesToCheck(moduleName);
    check.verify.array(toCheck, 'dependencies to check should be an array');

    var testVersionsBound = testVersions.bind(null, {
        modules: toCheck,
        command: checkCommand,
        all: all,
        color: options.color,
        keep: options.keep,
        allowed: options.allow || options.allowed
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
    check.verify.string(name, 'expected module name string, not ' +
        JSON.stringify(name));
    var parsed = nameVersionParser(name);
    if (check.object(parsed)) {
        return false;
    }
    return check.string(parsed.version);
}

module.exports = {
    checkCurrentInstall: checkCurrentInstall,
    checkAllUpdates: checkAllUpdates,
    available: available
};
