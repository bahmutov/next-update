var check = require('check-type');
var spawn = require('child_process').spawn;

function test(callback) {
    check.verifyFunction(callback, 'expected callback function');

    var npm = spawn('npm', ['test']);
    var testOutput = '';
    var testErrors = '';

    npm.stdout.setEncoding('utf-8');
    npm.stdout.on('data', function (data) {
        testOutput += data.trim();
    });

    npm.stderr.setEncoding('utf-8');
    npm.stderr.on('data', function (data) {
        testErrors += data.trim();
    });

    npm.on('exit', function (code) {
        if (code) {
            console.error('npm test returned', code);
            console.error('test errors:\n' + testErrors);
        }
        callback(null, code);
    });
}

module.exports = test;