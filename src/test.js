var check = require('check-types');
var spawn = require('child_process').spawn;
var q = require('q');

// returns a promise
function test() {
    console.log('running npm test command');
    var npm = spawn('C:\\Program Files\\nodejs\\npm.cmd', ['test']);
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

module.exports = test;