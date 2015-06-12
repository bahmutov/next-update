var check = require('check-types');
var _ = require('lodash');
var registry = require('./registry');
var cleanVersions = registry.cleanVersions;

function format(label, deps) {
    check.verify.unemptyString(label, 'missing label');
    check.verify.object(deps, 'expected deps');
    return Object.keys(deps).map(function (name) {
        return {
            type: label,
            name: name,
            version: deps[name]
        };
    });
}

function getKnownDependencies(packageFilename) {
    check.verify.string(packageFilename, 'missing package filename string');

    var workingPackage = require(packageFilename);

    var dependencies = workingPackage.dependencies || {};
    var devDependencies = workingPackage.devDependencies || {};
    var peerDependencies = workingPackage.peerDependencies || {};

    var all = [].concat(
        format('prod', dependencies),
        format('dev', devDependencies),
        format('peer', peerDependencies)
    );

    var cleaned = cleanVersions(all);
    // console.log('nameVersionPairs', cleaned);
    return cleaned;
}

module.exports = getKnownDependencies;
