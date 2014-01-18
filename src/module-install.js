var check = require('check-types');
var spawn = require('child_process').spawn;
var q = require('q');
var NPM_PATH = require('npm-utils').path;

// returns a promise
function installModule(name, version, results) {
    check.verify.string(name, 'expected module name string');
    check.verify.string(version, 'expected version string');

    var moduleVersion = name + '@' + version;
    console.log('  installing', moduleVersion);
    var npm = spawn(NPM_PATH, ['install', moduleVersion]);
    var testOutput = '';
    var testErrors = '';

    npm.stdout.setEncoding('utf-8');
    npm.stderr.setEncoding('utf-8');

    function hasError(str) {
        return /error/i.test(str);
    }

    npm.stdout.on('data', function (data) {
        if (hasError(data)) {
            console.log('stdout:', data);
        }
        testOutput += data;
    });

    npm.stderr.on('data', function (data) {
        if (hasError(data)) {
            console.log('stderr:', data);
        }
        testErrors += data;
    });

    npm.on('error', function (err) {
        console.error('error:', err);
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
            console.log(moduleVersion, 'installed successfully');
            deferred.resolve(results);
        }
    });
    return deferred.promise;
}

module.exports = installModule;
