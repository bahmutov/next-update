var check = require('check-types');
var path = require('path');
var print = require('./print-modules-table');
var nameVersionParser = require('./moduleName');
var getKnownDependencies = require('./get-known-dependencies');

function printCurrentModules(infos) {
    check.verify.array(infos, 'expected array of modules');

    var modules = [];
    infos.forEach(function (nameVersionArray) {
        check.verify.array(nameVersionArray, 'expected name version in ' + modules);
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
        if (check.string(moduleNames)) {
            moduleNames = [moduleNames];
        }

        if (check.object(moduleNames)) {
            var names = Object.keys(moduleNames);
            moduleNames = names;
        }

        check.verify.array(moduleNames, 'expected module names array ' +
            JSON.stringify(moduleNames));
    }
    var workingDirectory = process.cwd();

    var packageFilename = path.join(workingDirectory, 'package.json');
    var nameVersionPairs = getKnownDependencies(packageFilename);

    console.log('module\'s known dependencies:');
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

module.exports = getDependenciesToCheck;
