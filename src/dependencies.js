var check = require('check-types');
var path = require('path');
var _ = require('lodash');
var print = require('./print-modules-table');
var registry = require('./registry');
var cleanVersions = registry.cleanVersions;
var nameVersionParser = require('./moduleName');

function printCurrentModules(infos) {
    check.verifyArray(infos, 'expected array of modules');

    var modules = [];
    infos.forEach(function (nameVersionArray) {
        check.verifyArray(nameVersionArray, 'expected name version in ' + modules);
        modules.push({
            name: nameVersionArray[0],
            version: nameVersionArray[1]
        });
    });
    print(modules);
}

function getDependenciesToCheck(moduleNames) {
    if (moduleNames) {
        console.log('returning dependencies for');
        console.dir(moduleNames);
        if (check.isString(moduleNames)) {
            moduleNames = [moduleNames];
        }

        if (check.isObject(moduleNames)) {
            var names = Object.keys(moduleNames);
            moduleNames = names;
        }

        check.verifyArray(moduleNames, 'expected module names array ' +
            JSON.stringify(moduleNames));
    }
    var workingDirectory = process.cwd();

    var packageFilename = path.join(workingDirectory, 'package.json');
    var nameVersionPairs = getDependencies(packageFilename);
    console.log('module\'s dependencies:');
    printCurrentModules(nameVersionPairs);

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

module.exports = getDependenciesToCheck;
