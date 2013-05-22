var path = require('path');
var _ = require('lodash');
var check = require('check-types');
var q = require('q');

var nextVersions = require('./registry').nextVersions;
var testVersions = require('./test-module-version').testModulesVersions;

// var test = require('./test');

function nextUpdate() {
    var workingDirectory = process.cwd();
    console.log('working directory', workingDirectory);

    var workingPackage = require(path.join(workingDirectory, 'package.json'));
    var dependencies = workingPackage.dependencies || {};
    var devDependencies = workingPackage.devDependencies || {};
    _.extend(dependencies, devDependencies);

    var nameVersionPairs = _.pairs(dependencies);
    console.log('all dependencies\n', nameVersionPairs);

    var nextVersionsPromise = nextVersions(nameVersionPairs);
    return nextVersionsPromise;
}

module.exports = nextUpdate;