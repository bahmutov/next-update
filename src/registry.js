var request = require('request');
var check = require('check-types');
var semver = require('semver');
var q = require('q');
var localVersion = require('./local-module-version');
var isUrl = require('npm-utils').isUrl;
var _ = require('lodash');

var _registryUrl = require('npm-utils').registryUrl;
check.verify.fn(_registryUrl, 'expected registry url function');
var registryUrl = _.once(_registryUrl);

function cleanVersion(nameVersion) {
    check.verify.array(nameVersion, 'expected and array');
    console.assert(nameVersion.length === 2,
        'expected 2 items, name and version ' + nameVersion);
    var name = nameVersion[0];
    var version = nameVersion[1];
    check.verify.string(name, 'could not get module name from ' + nameVersion);
    check.verify.string(version, 'could not get module version from ' + nameVersion);

    if (isUrl(version)) {
        // version = version.substr(version.indexOf('#') + 1);

        // hmm, because we don't have a way to fetch git tags yet
        // just skip these dependencies
        console.log('Cannot handle git repos, skipping', name, 'at', version);
        return;
    }

    version = version.replace('~', '');
    var twoDigitVersion = /^\d+\.\d+$/;
    if (twoDigitVersion.test(version)) {
        version += '.0';
    }
    if (version === 'latest' || version === '*') {
        console.log('Module', name, 'uses version', version);
        console.log('It is recommented to list a specific version number');
        version = localVersion(name);
        if (!version) {
            version = '0.0.1';
        }
        console.log('module', name, 'local version', version);
    }
    version = semver.clean(version);
    console.assert(version, 'could not clean version ' + nameVersion[1]);
    nameVersion[1] = version;
    return nameVersion;
}

function cleanVersions(nameVersionPairs) {
    check.verify.array(nameVersionPairs, 'expected array');
    var cleaned = nameVersionPairs.map(cleanVersion)
        .filter(_.isArray);
    return cleaned;
}

// fetching versions inspired by
// https://github.com/jprichardson/npm-latest
// returns a promise
function fetchVersions(nameVersion) {
    check.verify.array(nameVersion, 'expected name / version array');
    var name = nameVersion[0];
    var version = nameVersion[1];
    check.verify.string(name, 'missing name string');
    check.verify.string(version, 'missing version string');

    // console.log('fetching versions for', name, 'current version', version);

    var deferred = q.defer();

    registryUrl().then(function (npmUrl) {
        check.verify.webUrl(npmUrl, 'need npm registry url, got ' + npmUrl);

        npmUrl = npmUrl.replace(/^https:/, 'http:').trim();
        var url = npmUrl + name;

        request.get(url, function (err, response, body) {
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

                var validVersions = versions.filter(semver.valid);
                var newerVersions = validVersions.filter(function (ver) {
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
    });

    return deferred.promise;
}

// returns a promise with available new versions
function nextVersions(nameVersionPairs, checkLatestOnly) {
    check.verify.array(nameVersionPairs, 'expected array');
    checkLatestOnly = !!checkLatestOnly;
    nameVersionPairs = cleanVersions(nameVersionPairs);

    var deferred = q.defer();

    console.log('checking NPM registry');
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
        } else {
            console.log('checking ALL versions');
        }
        deferred.resolve(available);
    }, function (error) {
        deferred.reject(error);
    });

    return deferred.promise;
}

module.exports = {
    isUrl: isUrl,
    cleanVersion: cleanVersion,
    cleanVersions: cleanVersions,
    fetchVersions: fetchVersions,
    nextVersions: nextVersions
};
