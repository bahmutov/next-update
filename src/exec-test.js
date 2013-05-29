var check = require('check-types');
var spawn = require('child_process').spawn;
var q = require('q');

// returns a promise
function test(testCommand) {
    check.verifyString(testCommand, 'missing test command string');

    var testParts = testCommand.split(' ');
    console.assert(testParts.length > 0, 'missing any test words in ' + testCommand)
    var testProcess = spawn(testParts, testParts.shift());
    var testOutput = '';
    var testErrors = '';

    testProcess.stdout.setEncoding('utf-8');
    testProcess.stderr.setEncoding('utf-8');

    testProcess.stdout.on('data', function (data) {
        testOutput += data;
    });

    testProcess.stderr.on('data', function (data) {
        testErrors += data;
    });

    testProcess.on('error', function (err) {
        console.error(err);
        testErrors += err.toString();
    });

    var deferred = q.defer();
    testProcess.on('exit', function (code) {
        if (code) {
            console.error('testProcess test returned', code);
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