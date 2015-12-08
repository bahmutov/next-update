var check = require('check-more-types');
var verify = check.verify;
var spawn = require('child_process').spawn;
var q = require('q');
var npmPath = require('./npm-test').npmPath;

// returns a promise
function test(options, testCommand) {
    options = options || {};
    var log = options.tldr ? _.noop : console.log.bind(console);

    verify.unemptyString(testCommand, 'missing test command string');
    log(' ', testCommand);

    var testParts = testCommand.split(' ');
    console.assert(testParts.length > 0, 'missing any test words in ' + testCommand);
    var testExecutable = testParts.shift();
    verify.unemptyString(testExecutable, 'missing test executable for command ' + testCommand);
    if (testExecutable === 'npm') {
        testExecutable = npmPath;
    }
    var testProcess = spawn(testExecutable, testParts);
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

    var deferred = q.defer();
    testProcess.on('error', function (err) {
        console.error('test command: "' + testCommand + '"');
        console.error(err);
        testErrors += err.toString();
        deferred.reject({
            code: err.code,
            errors: testErrors
        });
    });

    testProcess.on('exit', function (code) {
        if (code) {
            console.error('testProcess test returned', code);
            console.error('test errors:\n' + testErrors);
            console.error(testOutput);
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
