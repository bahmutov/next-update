var path = require('path');
var _ = require('lodash');
var check = require('check-types');
var q = require('q');

var registry = require('./registry');
var nextVersions = registry.nextVersions;
var cleanVersions = registry.cleanVersions;
var testVersions = require('./test-module-version').testModulesVersions;
var installModule = require('./module-install');

// returns promise
function allUpdates(moduleName, checkLatestOnly) {
    checkLatestOnly = !!checkLatestOnly;
    var toCheck = getDependenciesToCheck(moduleName);
    var nextVersionsPromise = nextVersions(toCheck, checkLatestOnly);
    return nextVersionsPromise.then(testVersions.bind(null, toCheck));
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

function getDependenciesToCheck(moduleName) {
    if (moduleName) {
        check.verifyString(moduleName, 'expected module name string ' +
            JSON.stringify(moduleName));
    }
    var workingDirectory = process.cwd();
    console.log('working directory', workingDirectory);

    var packageFilename = path.join(workingDirectory, 'package.json')
    var nameVersionPairs = getDependencies(packageFilename);
    console.log("module's dependencies\n", nameVersionPairs);

    var toCheck = nameVersionPairs;
    if (moduleName) {
        toCheck = nameVersionPairs.filter(function (nameVersion) {
            return nameVersion[0] === moduleName;
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
    revert: revert
};