var path = require('path');
var _ = require('lodash');
var async = require('async');
var check = require('check-types');

var allVersions = require('./registry').allVersions;
var test = require('./test');

function nextUpdate() {
    var workingDirectory = process.cwd();
    console.log('working directory', workingDirectory);

    var workingPackage = require(path.join(workingDirectory, 'package.json'));
    var dependencies = workingPackage.dependencies || {};
    var devDependencies = workingPackage.devDependencies || {};
    _.extend(dependencies, devDependencies);

    var nameVersionPairs = _.pairs(dependencies);
    console.log('all dependencies\n', nameVersionPairs);

    console.log('fetching dependencies details');
    async.map(nameVersionPairs, allVersions, function (err, results) {
        if (err) {
            console.error('ERROR fetching versions ' + err);
            throw err;
        }

        var available = results.filter(function (nameNewVersions) {
            return nameNewVersions.versions.length;
        });
        checkVersions(available);
    });
}

// expect array of objects, each {name, versions (Array) }
function checkVersions(available) {
    check.verifyArray(available);
    console.log('newer version available');
    console.log(available);
    async.map(available, checkModuleVersions, function (err, results) {
        console.log('next update:');
        console.log(results);
        console.log('all done');
    });
}

function checkModuleVersions(nameVersions, callback) {
    var name = nameVersions.name;
    var versions = nameVersions.versions;
    check.verifyString(name, 'expected name string');
    check.verifyArray(versions, 'expected versions array');

    async.map(versions, testModuleVersion.bind(null, name), function (err, result)) {
        if (err) {
            console.error(err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });

    callback(null, {
        name: name,
        versions: nameVersions.versions
    });
}

function testModuleVersion(name, version, callback) {
    check.verifyString(name, 'missing module name');
    check.verifyString(version, 'missing version string');
    check.verifyFunction(callback, 'missing callback function');

    callback(null, true);
}

module.exports = nextUpdate;