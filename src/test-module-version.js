var check = require('check-types');
var q = require('q');
var _ = require('lodash');
var installModule = require('./module-install');
var reportSuccess = require('./report').reportSuccess;
var reportFailure = require('./report').reportFailure;

var cleanVersions = require('./registry').cleanVersions;
check.verifyFunction(cleanVersions, 'cleanVersions should be a function');

var revertModules = require('./revert');
check.verifyFunction(revertModules, 'revert is not a function, but ' +
    JSON.stringify(revertModules));

var npmTest = require('./npm-test').test;
var execTest = require('./exec-test');
var report = require('./report-available');

// expect array of objects, each {name, versions (Array) }
// returns promise
function testModulesVersions(options, available) {
    check.verifyObject(options, 'missing options');
    check.verifyArray(available, 'expected array of available modules');

    var cleaned = cleanVersions(options.modules);
    var listed = _.zipObject(cleaned);

    report(available);

    if (options.all) {
        var install = installAll(available);
        console.assert(install, 'could not get install all promise');
        var test = testPromise(options.command);
        console.assert(test, 'could not get test promise for command', options.command);
        console.dir(listed);
        console.dir(options.modules);
        var revert = revertModules.bind(null, listed);
        console.assert(revert, 'could not get revert promise');
        return install.then(test).then(revert);
    }

    return installEachTestRevert(listed, available, options.command);
}

// returns promise, does not revert
function installAll(available) {
    check.verifyArray(available, 'expected array');

    var installFunctions = available.map(function (nameVersions) {
        var name = nameVersions.name;
        var version = nameVersions.versions[0];
        check.verifyString(name, 'missing module name from ' +
            JSON.stringify(nameVersions));
        check.verifyString(version, 'missing module version from ' +
            JSON.stringify(nameVersions));

        var installFunction = installModule.bind(null, name, version);
        return installFunction;
    });
    var installAllPromise = installFunctions.reduce(q.when, q());
    return installAllPromise;
}

function installEachTestRevert(listed, available, command) {
    check.verifyObject(listed, 'expected listed object');
    check.verifyArray(available, 'expected array');

    var checkModulesFunctions = available.map(function (nameVersion) {
        var name = nameVersion.name;
        var currentVersion = listed[name];
        check.verifyString(currentVersion, 'cannot find current version for ' + name +
            ' among current dependencies ' + JSON.stringify(listed));

        var revertFunction = installModule.bind(null, name, currentVersion);
        var checkModuleFunction = testModuleVersions.bind(null, {
            moduleVersions: nameVersion,
            revertFunction: revertFunction,
            command: command
        });
        return checkModuleFunction;
    });
    var checkAllPromise = checkModulesFunctions.reduce(q.when, q());
    return checkAllPromise;
}

// test particular dependency with multiple versions
// returns promise
function testModuleVersions(options, results) {
    check.verifyObject(options, 'missing options');
    var nameVersions = options.moduleVersions;
    var restoreVersionFunc = options.revertFunction;

    var name = nameVersions.name;
    var versions = nameVersions.versions;
    check.verifyString(name, 'expected name string');
    check.verifyArray(versions, 'expected versions array');
    results = results || [];
    check.verifyArray(results, 'expected results array');

    var deferred = q.defer();
    var checkPromises = versions.map(function (version) {
        return testModuleVersion.bind(null, {
            name: name,
            version: version,
            command: options.command
        });
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
function testModuleVersion(options, results) {
    check.verifyObject(options, 'missing test module options');
    check.verifyString(options.name, 'missing module name');
    check.verifyString(options.version, 'missing version string');

    if (options.command) {
        check.verifyString(options.command, 'expected command string');
    }

    results = results || [];
    check.verifyArray(results, 'missing previous results array');

    var nameVersion = options.name + '@' + options.version;
    console.log('testing', nameVersion);

    var result = {
        name: options.name,
        version: options.version,
        works: true
    };

    var test = testPromise(options.command);
    console.assert(test, 'could not get test promise for command', options.command);

    var deferred = q.defer();
    var installPromise = installModule(options.name, options.version);
    installPromise.then(test).then(function () {
        reportSuccess(nameVersion + ' test success');
        results.push(result);
        deferred.resolve(results);
    }, function (error) {
        reportFailure(nameVersion + ' test failed :(');
        console.error(error);
        result.works = false;
        results.push(result);
        deferred.resolve(results);
    });
    return deferred.promise;
}

function testPromise(command) {
    var testFunction = npmTest;
    if (command) {
        check.verifyString(command, 'expected string command, not ' + command);
        testFunction = execTest.bind(null, command);
    }
    return testFunction;
}

module.exports = {
    testModulesVersions: testModulesVersions,
    testModuleVersion: testModuleVersion
};