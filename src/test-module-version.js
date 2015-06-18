var check = require('check-types');
var verify = check.verify;
var q = require('q');
var _ = require('lodash');
var semver = require('semver');
var quote = require('quote');
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
var filterAllowed = require('./filter-allowed-updates');

// expect array of objects, each {name, versions (Array) }
// returns promise
function testModulesVersions(options, available) {
    verify.object(options, 'missing options');
    verify.array(available, 'expected array of available modules');

    var cleaned = cleanVersions(options.modules);
    // console.log('cleaned', cleaned);
    // var listed = _.zipObject(cleaned);
    var names = _.pluck(cleaned, 'name');
    var listed = _.zipObject(names, cleaned);

    /*
    console.log('testing module versions');
    console.log('current versions', listed);
    console.log('options', options);
    console.log('available', available);
    */

    var allowed = filterAllowed(listed, available, options);
    la(check.array(allowed), 'could not filter allowed updates', listed, available, options);

    if (available.length && !allowed.length) {
        console.log('No updates allowed using option', quote(options.allow || options.allowed));
        console.log(available.length + ' available updates filtered');
        return q(listed);
    }

    // console.log('allowed', allowed);
    return q.when(report(allowed, listed, options))
        .then(function testInstalls() {
            // console.log('testing installs');
            if (options.all) {
                var install = installAll(allowed);
                console.assert(install, 'could not get install all promise');
                var test = testPromise(options.command);
                console.assert(test, 'could not get test promise for command', options.command);
                // console.dir(listed);
                // console.dir(options.modules);

                var installThenTest = install.then(test);
                if (options.keep) {
                    return installThenTest;
                }

                var revert = revertModules.bind(null, listed);
                console.assert(revert, 'could not get revert promise');
                return installThenTest.then(revert);
            }

            return installEachTestRevert(listed, allowed,
                options.command, options.color, options.keep);
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

        var installFunction = installModule.bind(null, name, version, false);
        return installFunction;
    });
    var installAllPromise = installFunctions.reduce(q.when, q());
    return installAllPromise;
}

function installEachTestRevert(listed, available, command, color, keep) {
    verify.object(listed, 'expected listed object');
    verify.array(available, 'expected array');

    var checkModulesFunctions = available.map(function (nameVersion) {
        var name = nameVersion.name;
        var currentVersion = listed[name].version;
        la(check.string(currentVersion), 'cannot find current version for', name,
            'among current dependencies', listed);

        var revertFunction = installModule.bind(null, name, currentVersion, keep);

        var checkModuleFunction = testModuleVersions.bind(null, {
            moduleVersions: nameVersion,
            revertFunction: revertFunction,
            command: command,
            color: color,
            currentVersion: currentVersion,
            keep: keep
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
    if (options.keep) {
        checkAllPromise = checkAllPromise.then(function (result) {
            verify.array(result, 'expected array of results', result);
            var lastSuccess = _.last(_.filter(result, { works: true }));
            if (lastSuccess) {
                console.log('keeping last working version', lastSuccess.name + '@' + lastSuccess.version);
                return installModule(lastSuccess.name, lastSuccess.version, true, result);
            } else {
                return restoreVersionFunc().then(function () {
                    // console.log('returning result after reverting', result);
                    return q(result);
                });
            }
        });
    } else {
        checkAllPromise = checkAllPromise
            .then(restoreVersionFunc);
    }
    checkAllPromise
        .then(function (result) {
            check.verify.array(result, 'could not get result array');
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
        from: options.currentVersion,
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
        return installModule(options.name, options.version, false);
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
