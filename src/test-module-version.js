var check = require('check-types');
var q = require('q');
var _ = require('lodash');
var installModule = require('./module-install');
var testModule = require('./npm-test');
var reportSuccess = require('./report').reportSuccess;
var reportFailure = require('./report').reportFailure;
var cleanVersions = require('./registry').cleanVersions;
check.verifyFunction(cleanVersions, 'cleanVersions should be a function');

// expect array of objects, each {name, versions (Array) }
// returns promise
function testModulesVersions(currentNameVersions, available) {
    check.verifyArray(available, 'expected array of available modules');

    var cleaned = cleanVersions(currentNameVersions);
    var listed = _.zipObject(cleaned);

    console.log('newer version available');
    console.log(available);

    var checkModulesFunctions = available.map(function (nameVersion) {
        var name = nameVersion.name;
        var currentVersion = listed[name];
        check.verifyString(currentVersion, 'cannot find current version for ' + name +
            ' among current dependencies ' + JSON.stringify(listed));

        var installFunction = installModule.bind(null, name, currentVersion);
        var checkModuleFunction = testModuleVersions.bind(null, nameVersion, installFunction);
        return checkModuleFunction;
    });
    var checkAllPromise = checkModulesFunctions.reduce(q.when, q());
    return checkAllPromise;
}

// test particular dependency with multiple versions
// returns promise
function testModuleVersions(nameVersions, restoreVersionFunc, results) {
    var name = nameVersions.name;
    var versions = nameVersions.versions;
    check.verifyString(name, 'expected name string');
    check.verifyArray(versions, 'expected versions array');
    results = results || [];
    check.verifyArray(results, 'expected results array');

    var deferred = q.defer();
    var checkPromises = versions.map(function (version) {
        return testModuleVersion.bind(null, name, version);
    });
    var checkAllPromise = checkPromises.reduce(q.when, q());
    checkAllPromise
    .then(restoreVersionFunc)
    .then(function (result) {
        results.push(result);
        deferred.resolve(results);
    }, function (error) {
        console.error('could not check', nameVersions, error);
        deferred.reject(error);
    });

    return deferred.promise;
}

// checks specific module@version
// returns promise
function testModuleVersion(name, version, results) {
    check.verifyString(name, 'missing module name');
    check.verifyString(version, 'missing version string');
    results = results || [];
    check.verifyArray(results, 'missing previous results array');

    var nameVersion = name + '@' + version;
    console.log('testing', nameVersion);

    var result = {
        name: name,
        version: version,
        works: true
    };

    var deferred = q.defer();
    var installPromise = installModule(name, version);
    installPromise.then(testModule).then(function () {
        reportSuccess(nameVersion + ' test success');
        results.push(result);
        deferred.resolve(results);
    }, function (error) {
        reportFailure(nameVersion + ' test failed :(');
        result.works = false;
        results.push(result);
        deferred.resolve(results);
    });
    return deferred.promise;
}

module.exports = {
    testModulesVersions: testModulesVersions,
    testModuleVersion: testModuleVersion
};