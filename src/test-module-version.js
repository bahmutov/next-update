var check = require('check-types');
var q = require('q');
var installModule = require('./module-install');
var testModule = require('./test');

// expect array of objects, each {name, versions (Array) }
// returns promise
function testModulesVersions(available) {
    check.verifyArray(available);
    console.log('newer version available');
    console.log(available);

    var checkPromises = available.map(testModuleVersions);
    var checkAllPromise = q.all(checkPromises);
    return checkAllPromise;
}

// test particular dependency with multiple versions
// returns promise
function testModuleVersions(nameVersions) {
    var name = nameVersions.name;
    var versions = nameVersions.versions;
    check.verifyString(name, 'expected name string');
    check.verifyArray(versions, 'expected versions array');

    var deferred = q.defer();
    var checkPromises = versions.map(function (version) {
        return testModuleVersion.bind(null, name, version);
    });
    var checkAllPromise = checkPromises.reduce(q.when, q());

    return checkAllPromise;
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
        console.log(nameVersion, 'test success');
        results.push(result);
        deferred.resolve(results);
    }, function (error) {
        console.error(nameVersion, 'test failed :(');
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