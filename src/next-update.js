var path = require('path');
var _ = require('lodash');
var check = require('check-types');
var q = require('q');

var nameVersionParser = require('./moduleName');
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
        all: all
    });

    if (moduleName.length === 1 && nameVersionParser(moduleName[0]).version) {
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

// returns promise
function revert(moduleName) {
    console.log('should revert', JSON.stringify(moduleName));

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
                var moduleName = nameVersionParser(aModule).name;
                return name === moduleName;
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
    checkAllUpdates: checkAllUpdates,
    revert: revert,
    available: available
};