var request = require('request');
var check = require('check-types');
var _ = require('lodash');
var semver = require('semver');
var q = require('q');

var NPM_URL = 'http://registry.npmjs.org/';

// fetching versions inspired by
// https://github.com/jprichardson/npm-latest
// returns a promise
function fetchVersions(nameVersion) {
    check.verifyArray(nameVersion, 'expected name / version array');
    var name = nameVersion[0];
    var version = nameVersion[1];
    check.verifyString(name, 'missing name string');
    check.verifyString(version, 'missing version string');
    // check.verifyFunction(callback, 'missing callback function');

    version = version.replace('~', '');
    version = semver.clean(version);
    console.log('fetching versions for', name, 'current version', version);

    var url = NPM_URL + name;
    var deferred = q.defer();
    request(url, function (err, response, body) {
        if (err) {
            console.error("ERROR when fetching info for package", name);
            deferred.reject(err.message);
        }

        var info = JSON.parse(body);
        if (info.error) {
            deferred.reject('ERROR in npm info for ' + name + ' reason ' + info.reason);
        }
        var versions = Object.keys(info.time);
        var newerVersions = versions.filter(function (ver) {
            var later = semver.gt(ver, version);
            return later;
        });

        deferred.resolve({
            name: name,
            versions: newerVersions
        });
    });

    return deferred.promise;
}

// returns a promise with available new versions
function nextVersions(nameVersionPairs) {
    check.verifyArray(nameVersionPairs, 'expected array');

    var deferred = q.defer();

    console.log('fetching dependencies details');
    var fetchPromises = nameVersionPairs.map(fetchVersions);
    var fetchAllPromise = q.all(fetchPromises);

    fetchAllPromise.then(function (results) {
        var available = results.filter(function (nameNewVersions) {
            return nameNewVersions.versions.length;
        });
        console.log('fetched all result', available);
    }, function (error) {
        deferred.reject(error);
    })

    return deferred.promise;
}

module.exports = {
    fetchVersions: fetchVersions,
    nextVersions: nextVersions
};