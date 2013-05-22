var check = require('check-types');
var q = require('q');

// expect array of objects, each {name, versions (Array) }
// returns promise
function testModulesVersions(available) {
    check.verifyArray(available);
    console.log('newer version available');
    console.log(available);

    var checkPromises = available.map(testModuleVersions);
    var checkAllPromise = q.all(checkPromises);
    return checkAllPromise;
    /*
    var deferred = q.defer();
    // async.map(available, checkModuleVersions, function (err, results) {
        if (err) {
            deferred.reject(err);
        } else {
            console.log('next update:');
            console.log(results);
            console.log('all done');
            deferred.resolve(results);
        }
    });

    return deferred.promise;
    */
}

// test particular dependency with multiple versions
// returns promise
function testModuleVersions(nameVersions) {
    var name = nameVersions.name;
    var versions = nameVersions.versions;
    check.verifyString(name, 'expected name string');
    check.verifyArray(versions, 'expected versions array');

    var checkPromises = versions.map(testModuleVersion.bind(null, name));
    var checkAllPromise = q.all(checkPromises);
    return checkAllPromise;

    /*
    async.map(versions, testModuleVersion.bind(null, name), function (err, result) {
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
    */
}

// checks specific module@version
// returns promise
function testModuleVersion(name, version) {
    check.verifyString(name, 'missing module name');
    check.verifyString(version, 'missing version string');

    console.log('testing', name, '@', version);
    var deferred = q.defer();
    deferred.resolve(true);
    return deferred.promise;
}

module.exports = {
    testModulesVersions: testModulesVersions,
    testModuleVersion: testModuleVersion
};