var check = require('check-types');
var spawn = require('child_process').spawn;
var q = require('q');
var _ = require('lodash');

// hack to find npm bin script reliably
function findNpmPath() {
    var os = require('os');
    var type = os.type();
    return (/windows/gi).test(type) ? 'npm.cmd' : 'npm';
}

var NPM_PATH = findNpmPath();

// returns a promise
function test(options) {
    options = options || {};
    var log = options.tldr ? _.noop : process.stdout.write.bind(process.stdout);
    var errorLog = options.tldr ? _.noop : process.stderr.write.bind(process.stderr);
    log('  npm test');

    check.verify.string(NPM_PATH, 'missing npm path string');
    var npm = spawn(NPM_PATH, ['test']);
    var testOutput = '';
    var testErrors = '';

    npm.stdout.setEncoding('utf-8');
    npm.stderr.setEncoding('utf-8');

    npm.stdout.on('data', function (data) {
        testOutput += data;
        log(data);
    });

    npm.stderr.on('data', function (data) {
        testErrors += data;
        log(data);
    });

    npm.on('error', function (err) {
        errorLog(err);
        testErrors += err.toString();
    });

    var deferred = q.defer();
    npm.on('exit', function (code) {
        if (code) {
            errorLog('npm test returned', code);
            errorLog('test errors:\n' + testErrors);

            deferred.reject({
                code: code,
                errors: testErrors
            });
        }
        deferred.resolve();
    });
    return deferred.promise;
}

module.exports = {
    test: test,
    npmPath: findNpmPath()
};
