var path = require('path');
var _ = require('lodash');
var check = require('check-types');

var registry = require('./registry');
var nextVersions = registry.nextVersions;
var testVersions = require('./test-module-version').testModulesVersions;

// returns promise
function nextUpdate() {
    var workingDirectory = process.cwd();
    console.log('working directory', workingDirectory);

    var packageFilename = path.join(workingDirectory, 'package.json')
    var nameVersionPairs = getDependencies(packageFilename);
    console.log("module's dependencies\n", nameVersionPairs);

    var nextVersionsPromise = nextVersions(nameVersionPairs);
    return nextVersionsPromise.then(testVersions.bind(null, nameVersionPairs));
}

function getDependencies(packageFilename) {
    check.verifyString(packageFilename, 'missing package filename string');

    var workingPackage = require(packageFilename);
    var dependencies = workingPackage.dependencies || {};
    var devDependencies = workingPackage.devDependencies || {};
    _.extend(dependencies, devDependencies);

    var nameVersionPairs = _.pairs(dependencies);
    return nameVersionPairs;
}

module.exports = nextUpdate;