var request = require('request');
var check = require('check-types');
var semver = require('semver');
var q = require('q');

var NPM_URL = 'http://registry.npmjs.org/';

function cleanVersions(nameVersionPairs) {
    check.verifyArray(nameVersionPairs, 'expected array');
    var cleaned = nameVersionPairs.map(function (nameVersion) {
        var version = nameVersion[1];
        version = version.replace('~', '');
        var twoDigitVersion = /^\d+\.\d+$/;
        if (twoDigitVersion.test(version)) {
            version += '.0';
        }
        if (version === 'latest' || version === '*') {
            version = '0.0.0';
        }
        version = semver.clean(version);
        console.assert(version, 'could not clean version ' + nameVersion[1]);
        nameVersion[1] = version;
        return nameVersion;
    });
    return cleaned;
}

// fetching versions inspired by
// https://github.com/jprichardson/npm-latest
// returns a promise
function fetchVersions(nameVersion) {
    check.verifyArray(nameVersion, 'expected name / version array');
    var name = nameVersion[0];
    var version = nameVersion[1];
    check.verifyString(name, 'missing name string');
    check.verifyString(version, 'missing version string');

    console.log('fetching versions for', name, 'current version', version);

    var url = NPM_URL + name;
    var deferred = q.defer();
    request(url, function (err, response, body) {
        if (err) {
            console.error('ERROR when fetching info for package', name);
            deferred.reject(err.message);
            return;
        }

        try {
            var info = JSON.parse(body);
            if (info.error) {
                var str = 'ERROR in npm info for ' + name + ' reason ' + info.reason;
                console.error(str);
                deferred.reject(str);
                return;
            }
            var versions;
            if (info.time) {
                versions = Object.keys(info.time);
            } else if (info.versions) {
                versions = Object.keys(info.versions);
            }
            if (!Array.isArray(versions)) {
                throw new Error('Could not get versions for ' + name + ' from ' + info);
            }

            var newerVersions = versions.filter(function (ver) {
                var later = semver.gt(ver, version);
                return later;
            });

            deferred.resolve({
                name: name,
                versions: newerVersions
            });
            return;
        } catch (err) {
            console.error(err);
            deferred.reject('Could not fetch versions for ' + name);
            return;
        }
    });

    return deferred.promise;
}

// returns a promise with available new versions
function nextVersions(nameVersionPairs, checkLatestOnly) {
    check.verifyArray(nameVersionPairs, 'expected array');
    checkLatestOnly = !!checkLatestOnly;
    nameVersionPairs = cleanVersions(nameVersionPairs);

    var deferred = q.defer();

    var fetchPromises = nameVersionPairs.map(fetchVersions);
    var fetchAllPromise = q.all(fetchPromises);

    fetchAllPromise.then(function (results) {
        var available = results.filter(function (nameNewVersions) {
            return nameNewVersions.versions.length;
        });
        if (checkLatestOnly) {
            available = available.map(function (nameVersions) {
                if (nameVersions.versions.length > 1) {
                    nameVersions.versions = nameVersions.versions.slice(-1);
                }
                return nameVersions;
            });
            console.log('only checking latest versions\n', available);
        }
        deferred.resolve(available);
    }, function (error) {
        deferred.reject(error);
    });

    return deferred.promise;
}

module.exports = {
    cleanVersions: cleanVersions,
    fetchVersions: fetchVersions,
    nextVersions: nextVersions
};