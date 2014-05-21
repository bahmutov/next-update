var check = require('check-types');
var verify = check.verify;
var q = require('q');
var _ = require('lodash');
var semver = require('semver');
var installModule = require('./module-install');
var reportSuccess = require('./report').reportSuccess;
var reportFailure = require('./report').reportFailure;

var stats = require('./stats');

var cleanVersions = require('./registry').cleanVersions;
check.verify.fn(cleanVersions, 'cleanVersions should be a function');

var revertModules = require('./revert');
check.verify.fn(revertModules, 'revert is not a function, but ' +
    JSON.stringify(revertModules));

var npmTest = require('./npm-test').test;
var execTest = require('./exec-test');
var report = require('./report-available');

// expect array of objects, each {name, versions (Array) }
// returns promise
function testModulesVersions(options, available) {
    verify.object(options, 'missing options');
    verify.array(available, 'expected array of available modules');

    var cleaned = cleanVersions(options.modules);
    var listed = _.zipObject(cleaned);

    return q.when(report(available, listed, options))
    .then(function () {
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

        return installEachTestRevert(listed, available, options.command, options.color);
    });
}

// returns promise, does not revert
function installAll(available) {
    verify.array(available, 'expected array');

    var installFunctions = available.map(function (nameVersions) {
        var name = nameVersions.name;
        var version = nameVersions.versions[0];
        verify.string(name, 'missing module name from ' +
            JSON.stringify(nameVersions));
        verify.string(version, 'missing module version from ' +
            JSON.stringify(nameVersions));

        var installFunction = installModule.bind(null, name, version);
        return installFunction;
    });
    var installAllPromise = installFunctions.reduce(q.when, q());
    return installAllPromise;
}

function installEachTestRevert(listed, available, command, color) {
    verify.object(listed, 'expected listed object');
    verify.array(available, 'expected array');

    var checkModulesFunctions = available.map(function (nameVersion) {
        var name = nameVersion.name;
        var currentVersion = listed[name];
        verify.string(currentVersion, 'cannot find current version for ' + name +
            ' among current dependencies ' + JSON.stringify(listed));

        var revertFunction = installModule.bind(null, name, currentVersion);
        var checkModuleFunction = testModuleVersions.bind(null, {
            moduleVersions: nameVersion,
            revertFunction: revertFunction,
            command: command,
            color: color,
            currentVersion: currentVersion
        });
        return checkModuleFunction;
    });
    var checkAllPromise = checkModulesFunctions.reduce(q.when, q());
    return checkAllPromise;
}

// test particular dependency with multiple versions
// returns promise
function testModuleVersions(options, results) {
    verify.object(options, 'missing options');
    var nameVersions = options.moduleVersions;
    var restoreVersionFunc = options.revertFunction;

    var name = nameVersions.name;
    var versions = nameVersions.versions;
    verify.string(name, 'expected name string');
    verify.array(versions, 'expected versions array');
    results = results || [];
    verify.array(results, 'expected results array');
    if (!semver.valid(options.currentVersion)) {
        throw new Error('do not have current version for ' + name);
    }

    var deferred = q.defer();
    var checkPromises = versions.map(function (version) {
        return testModuleVersion.bind(null, {
            name: name,
            version: version,
            command: options.command,
            color: options.color,
            currentVersion: options.currentVersion
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

var logLine = (function formLine() {
    var n = process.stdout.isTTY ? process.stdout.columns : 40;
    verify.positiveNumber(n, 'expected to get terminal width, got ' + n);
    var k;
    var str = '';
    for(k = 0; k < n; k += 1) {
        str += '-'
    }
    return function () {
        console.log(str);
    };
}());

// checks specific module@version
// returns promise
function testModuleVersion(options, results) {
    verify.object(options, 'missing test module options');
    verify.string(options.name, 'missing module name');
    verify.string(options.version, 'missing version string');
    verify.unemptyString(options.currentVersion, 'missing current version');

    if (options.command) {
        verify.string(options.command, 'expected command string');
    }
    // console.log('options', options);

    results = results || [];
    verify.array(results, 'missing previous results array');

    var nameVersion = options.name + '@' + options.version;
    console.log('\ntesting', nameVersion);

    var result = {
        name: options.name,
        version: options.version,
        works: true
    };

    var test = testPromise(options.command);
    console.assert(test, 'could not get test promise for command', options.command);

    var deferred = q.defer();

    var getSuccess = stats.getSuccessStats({
        name: options.name,
        from: options.currentVersion,
        to: options.version
    });

    getSuccess
    .then(stats.printStats.bind(null, options), function () {
        console.log('could not get update stats', options.name);
        return;
    })
    .then(function () {
        return installModule(options.name, options.version);
    })
    .then(test)
    .then(function () {
        reportSuccess(nameVersion + ' works', options.color);

        stats.sendUpdateResult({
            name: options.name,
            from: options.currentVersion,
            to: options.version,
            success: true
        });
        results.push(result);
        deferred.resolve(results);
    }, function (error) {
        reportFailure(nameVersion + ' tests failed :(', options.color);

        stats.sendUpdateResult({
            name: options.name,
            from: options.currentVersion,
            to: options.version,
            success: false
        });

        verify.number(error.code, 'expected code in error ' +
            JSON.stringify(error, null, 2));
        logLine();
        console.error('test finished with exit code', error.code);
        verify.string(error.errors, 'expected errors string in error ' +
            JSON.stringify(error, null, 2));
        console.error(error.errors);
        logLine();

        result.works = false;
        results.push(result);
        deferred.resolve(results);
    });
    return deferred.promise;
}

function testPromise(command) {
    var testFunction = npmTest;
    if (command) {
        verify.unemptyString(command, 'expected string command, not ' + command);
        testFunction = execTest.bind(null, command);
    }
    return testFunction;
}

module.exports = {
    testModulesVersions: testModulesVersions,
    testModuleVersion: testModuleVersion,
    testPromise: testPromise
};
