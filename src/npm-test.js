var check = require('check-types');
var spawn = require('child_process').spawn;
var q = require('q');

// hack to find npm bin script reliably
function findNpmPath() {
    var os = require('os');
    var type = os.type();
    return (/windows/gi).test(type) ? 'npm.cmd' : 'npm';
}

var NPM_PATH = findNpmPath();

// returns a promise
function test() {
    console.log('  npm test');
    check.verify.string(NPM_PATH, 'missing npm path string');
    var npm = spawn(NPM_PATH, ['test']);
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
            console.error('npm test returned', code);
            console.error('test errors:\n' + testErrors);
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
