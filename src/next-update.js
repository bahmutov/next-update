var path = require('path');
var _ = require('lodash');
// var async = require('async');
var check = require('check-types');
var q = require('q');

var fetchVersions = require('./registry').fetchVersions;
var test = require('./test');

// returns a promise with available new versions
function nextUpdate() {
    var workingDirectory = process.cwd();
    console.log('working directory', workingDirectory);

    var workingPackage = require(path.join(workingDirectory, 'package.json'));
    var dependencies = workingPackage.dependencies || {};
    var devDependencies = workingPackage.devDependencies || {};
    _.extend(dependencies, devDependencies);

    var nameVersionPairs = _.pairs(dependencies);
    console.log('all dependencies\n', nameVersionPairs);

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
    /*
    async.map(nameVersionPairs, allVersions, function (err, results) {
        if (err) {
            console.error('ERROR fetching versions ' + err);
            // throw err;
            deferred.reject(err);
        }

        var checkPromise = checkVersions(available);
        checkPromise.then(function (results) {
            deferred.resolve(results);
        }, function (error) {
            deferred.reject(error);
        });
    });
    */

    return deferred.promise;
}

module.exports = nextUpdate;