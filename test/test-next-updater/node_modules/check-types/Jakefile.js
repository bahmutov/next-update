/*jshint nomen:false */
/*globals require, console, complete, __dirname, process */

'use strict';

var exec = require('child_process').exec,

commands = {
    minify: './node_modules/.bin/uglifyjs ./src/check-types.js --compress --mangle --output ./src/check-types.min.js',
    test: './node_modules/.bin/mocha --ui tdd --reporter spec --colors ./test/check-types.js',
    lint: './node_modules/.bin/jshint ./src/check-types.js --config config/jshint.json',
    prepare: 'npm install'
};

desc('Minify the source code for deployment.');
task('minify', function () {
    runTask('minify', 'Minifying...');
}, {
    async: true
});

desc('Run the unit tests.');
task('test', function () {
    runTask('test', 'Testing...');
}, {
    async: true
});

desc('Lint the source code.');
task('lint', function () {
    runTask('lint', 'Linting...');
}, {
    async: true
});

desc('Install dependencies.');
task('prepare', function () {
    runTask('prepare', 'Preparing the build environment...');
}, {
    async: true
});

function runTask (command, message) {
    console.log(message);
    runCommand(command);
}

function runCommand (command) {
    exec(commands[command], { cwd: __dirname }, function (error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (typeof error === 'object' && error !== null) {
            console.log(error.message);
            process.exit(1);
        }
        complete();
    });
}

