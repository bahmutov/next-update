var request = require('request');
var check = require('check-types');
var semver = require('semver');
var q = require('q');
var localVersion = require('./local-module-version');
var VerEx = require("verbal-expressions");
var _ = require('lodash');

var NPM_URL = 'http://registry.npmjs.org/';

var httpTester = VerEx()
    .startOfLine()
    .then( "http" )
    .maybe( "s" )
    .then( "://" )
    .anythingBut( " " )
    .endOfLine();

var gitTester = VerEx()
    .startOfLine()
    .then( "git" )
    .then( "://" )
    .anythingBut( " " )
    .endOfLine();

function isUrl(str) {
    check.verifyString(str, 'expected a string');
    return httpTester.test(str) || gitTester.test(str);
}

function cleanVersion(nameVersion) {
    check.verifyArray(nameVersion, 'expected and array');
    console.assert(nameVersion.length === 2,
        'expected 2 items, name and version ' + nameVersion);
    var name = nameVersion[0];
    var version = nameVersion[1];
    check.verifyString(name, 'could not get module name from ' + nameVersion);
    check.verifyString(version, 'could not get module version from ' + nameVersion);

    if (isUrl(version)) {
        version = version.substr(version.indexOf('#') + 1);
        // hmm, because we don't have a way to fetch git tags yet
        // just skip these dependencies
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
    check.verifyArray(nameVersionPairs, 'expected array');
    var cleaned = nameVersionPairs.map(cleanVersion)
        .filter(_.isArray);
    console.dir(cleaned);
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

    // console.log('fetching versions for', name, 'current version', version);

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
            if (available.length) {
                console.log(available);
            }
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
