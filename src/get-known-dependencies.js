var check = require('check-types');
var _ = require('lodash');
var registry = require('./registry');
var cleanVersions = registry.cleanVersions;

function getKnownDependencies(packageFilename) {
    check.verify.string(packageFilename, 'missing package filename string');

    var workingPackage = require(packageFilename);
    var dependencies = workingPackage.dependencies || {};
    var devDependencies = workingPackage.devDependencies || {};
    _.extend(dependencies, devDependencies);

    var nameVersionPairs = _.pairs(dependencies);
    var cleaned = cleanVersions(nameVersionPairs);
    return cleaned;
}

module.exports = getKnownDependencies;
