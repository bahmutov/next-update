#!/usr/bin/env node

var package = require('./package.json');

var info = package.name + ' - ' + package.description + '\n' +
    '  version: ' + package.version + '\n' +
    '  author: ' + JSON.stringify(package.author);

/*
var program = require('optimist')
    .usage(info)
    .argv;

if (process.argv.length === 2) {
    console.log(info);
    process.exit(0);
}
*/

/*
var nextUpdate = require('./src/next-update');
nextUpdate();
*/

var moduleVersions = [{
    name: 'lodash',
    versions: ['1.0.0']
}, {
    name: 'async',
    versions: ['0.1.0']
}];
var testVersions = require('./src/test-module-version').testModulesVersions;
var testPromise = testVersions(moduleVersions);
testPromise.then(function (results) {
    console.log('tested, results', results);
}, function (error) {
    console.error('failed', error);
});

/*
var test = require('./src/test');
var testedPromise = test();

testedPromise.then(function() {
    console.log('test passed');
}, function (error) {
    console.log('test failed with code', error.code);
});
*/