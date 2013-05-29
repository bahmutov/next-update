var path = require('path');
var _ = require('lodash');
var check = require('check-types');
var q = require('q');

var registry = require('./registry');
var nextVersions = registry.nextVersions;
var cleanVersions = registry.cleanVersions;
var testVersions = require('./test-module-version').testModulesVersions;
var installModule = require('./module-install');

function available(moduleName) {
    var toCheck = getDependenciesToCheck(moduleName);
    var nextVersionsPromise = nextVersions(toCheck);
    nextVersionsPromise.then(function (info) {
        console.log('available versions');
        console.dir(info);
    }, function (error) {
        console.error('Could not fetch available modules\n', error);
    });
}

// returns promise
function allUpdates(moduleName, checkLatestOnly, checkCommand) {
    checkLatestOnly = !!checkLatestOnly;
    if (checkCommand) {
        check.verifyString(checkCommand, 'expected string test command');
    }
    var toCheck = getDependenciesToCheck(moduleName);
    var nextVersionsPromise = nextVersions(toCheck, checkLatestOnly);
    var testVersionsBound = testVersions.bind(null, toCheck);
    return nextVersionsPromise.then(testVersionsBound);
}

// returns promise
function revert(moduleName) {
    var toCheck = getDependenciesToCheck(moduleName);
    var installPromises = toCheck.map(function (nameVersion) {
        var name = nameVersion[0];
        var version = nameVersion[1];
        return installModule.bind(null, name, version);
    });
    return installPromises.reduce(q.when, q());
}

function getDependenciesToCheck(moduleNames) {
    if (moduleNames) {
        if (check.isString(moduleNames)) {
            moduleNames = [moduleNames];
        }
        check.verifyArray(moduleNames, 'expected module names ' +
            JSON.stringify(moduleNames));
    }
    var workingDirectory = process.cwd();
    console.log('working directory', workingDirectory);

    var packageFilename = path.join(workingDirectory, 'package.json');
    var nameVersionPairs = getDependencies(packageFilename);
    console.log('module\'s dependencies\n', nameVersionPairs);

    var toCheck = nameVersionPairs;
    if (moduleNames) {
        toCheck = nameVersionPairs.filter(function (nameVersion) {
            var name = nameVersion[0];
            return moduleNames.some(function (aModule) {
                return name === aModule;
            });
        });
        console.log('only checking\n', toCheck);
    }
    return toCheck;
}

function getDependencies(packageFilename) {
    check.verifyString(packageFilename, 'missing package filename string');

    var workingPackage = require(packageFilename);
    var dependencies = workingPackage.dependencies || {};
    var devDependencies = workingPackage.devDependencies || {};
    _.extend(dependencies, devDependencies);

    var nameVersionPairs = _.pairs(dependencies);
    var cleaned = cleanVersions(nameVersionPairs);
    return cleaned;
}

module.exports = {
    checkAllUpdates: allUpdates,
    revert: revert,
    available: available
};