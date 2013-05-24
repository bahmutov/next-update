var check = require('check-types');
var spawn = require('child_process').spawn;
var q = require('q');

var NPM_PATH = 'C:\\Program Files\\nodejs\\npm.cmd';

// returns a promise
function installModule(name, version, results) {
    check.verifyString(name, 'expected module name string');
    check.verifyString(version, 'expected version string');

    var moduleVersion = name + '@' + version;
    console.log('  installing', moduleVersion);
    var npm = spawn(NPM_PATH, ['install', moduleVersion]);
    var testOutput = '';
    var testErrors = '';

    npm.stdout.setEncoding('utf-8');
    npm.stderr.setEncoding('utf-8');

    npm.stdout.on('data', function (data) {
        testOutput += data;
    });

    npm.stderr.on('data', function (data) {
        testErrors += data;
    });

    npm.on('error', function (err) {
        console.error(err);
        testErrors += err.toString();
    });

    var deferred = q.defer();
    npm.on('exit', function (code) {
        if (code) {
            console.error('npm returned', code);
            console.error('errors:\n' + testErrors);
            deferred.reject({
                code: code,
                errors: testErrors
            });
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
}

module.exports = installModule;