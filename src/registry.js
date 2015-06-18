var request = require('request');
var check = require('check-types');
var verify = check.verify;
var semver = require('semver');
var q = require('q');
var localVersion = require('./local-module-version');
var isUrl = require('npm-utils').isUrl;
var _ = require('lodash');

var _registryUrl = require('npm-utils').registryUrl;
check.verify.fn(_registryUrl, 'expected registry url function');
var registryUrl = _.once(_registryUrl);

function cleanVersion(version, name) {
    var originalVersion = version;
    verify.unemptyString(version, 'missing version string' + version);
    verify.unemptyString(name, 'missing name string' + name);

    if (isUrl(version)) {
        // version = version.substr(version.indexOf('#') + 1);

        // hmm, because we don't have a way to fetch git tags yet
        // just skip these dependencies
        console.log('Cannot handle git repos, skipping', name, 'at', version);
        return;
    }
    if (version === 'original' ||
        version === 'modified' ||
        version === 'created') {
        return;
    }

    version = version.replace('~', '').replace('^', '');
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
    try {
        version = semver.clean(version);
    } catch (err) {
        console.error('exception when cleaning version', version);
        return;
    }
    if (!version) {
        console.error('could not clean version ' + originalVersion + ' for ' + name);
        return;
    }
    console.assert(version, 'missing clean version ' + originalVersion + ' for ' + name);
    return version;
}

function cleanVersionPair(nameVersion) {
    check.verify.array(nameVersion, 'expected an array');
    console.assert(nameVersion.length === 2,
        'expected 2 items, name and version ' + nameVersion);
    var name = nameVersion[0];
    check.verify.string(name, 'could not get module name from ' + nameVersion);

    var version = nameVersion[1];
    check.verify.string(version, 'could not get module version from ' + nameVersion);
    version = cleanVersion(version, name);
    if (!version) {
        return;
    }

    nameVersion[1] = version;
    return nameVersion;
}

function cleanVersionObject(info) {
    check.verify.object(info, 'expected info');
    var name = info.name;
    check.verify.string(name, 'could not get module name from ' + info);

    var version = info.version;
    check.verify.string(version, 'could not get module version from ' + info);
    version = cleanVersion(version, name);

    if (!version) {
        return;
    }

    info.version = version;
    return info;
}

function cleanVersions(nameVersionPairs) {
    check.verify.array(nameVersionPairs, 'expected array');
    var cleaned = nameVersionPairs
        .map(cleanVersionObject)
        .filter(check.object);
    return cleaned;
}

// fetching versions inspired by
// https://github.com/jprichardson/npm-latest
// returns a promise
function fetchVersions(nameVersion) {
    // console.log(nameVersion);
    // TODO use check.schema
    check.verify.object(nameVersion, 'expected name, version object');
    var name = nameVersion.name;
    var version = nameVersion.version;
    check.verify.string(name, 'missing name string');
    check.verify.string(version, 'missing version string');

    // console.log('fetching versions for', name, 'current version', version);
    var MAX_WAIT_TIMEOUT = 5000;
    var deferred = q.defer();

    registryUrl().then(function (npmUrl) {
        check.verify.webUrl(npmUrl, 'need npm registry url, got ' + npmUrl);

        npmUrl = npmUrl.replace(/^https:/, 'http:').trim();
        var url = npmUrl + name;

        // TODO how to detect if the registry is not responding?

        request.get(url, onNPMversions);
        var timer = setTimeout(function () {
            var msg = 'timed out waiting for NPM for package ' + name;
            console.error(msg);
            deferred.reject(msg);
        }, MAX_WAIT_TIMEOUT);

        function onNPMversions(err, response, body) {
            clearTimeout(timer);

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

                var validVersions = versions.filter(function (version) {
                    return cleanVersion(version, name);
                });
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
        }
    });

    return deferred.promise;
}

// returns a promise with available new versions
function nextVersions(nameVersionPairs, checkLatestOnly) {
    check.verify.array(nameVersionPairs, 'expected array');
    checkLatestOnly = !!checkLatestOnly;
    nameVersionPairs = cleanVersions(nameVersionPairs);

    var MAX_CHECK_TIMEOUT = 10000;
    var deferred = q.defer();

    console.log('checking NPM registry');
    var fetchPromises = nameVersionPairs.map(fetchVersions);
    var fetchAllPromise = q.all(fetchPromises)
        .timeout(MAX_CHECK_TIMEOUT, 'timed out waiting for NPM');

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
