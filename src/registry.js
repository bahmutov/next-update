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
            // throw new Error(err.message);
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
        // console.dir(versions);
        /*
        callback(null, {
            name: name,
            versions: newerVersions
        });
        */
        deferred.resolve({
            name: name,
            versions: newerVersions
        });
    });

    return deferred.promise;
}

module.exports = {
    allVersions: fetchVersions
};