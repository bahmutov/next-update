#!/usr/bin/env node

var report = require('./src/report');
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

var nextUpdate = require('./src/next-update');
var nextUpdatePromise = nextUpdate();

nextUpdatePromise.then(function (results) {
    report(results);
}, function (error) {
    console.error('ERROR testing next working updates\n', error);
    throw new Error(error);
});

/*
var moduleVersions = [{
    name: 'lodash',
    versions: ['1.0.0', '1.0.1']
}, {
    name: 'async',
    versions: ['0.1.0', '0.2.0']
}];
var testVersions = require('./src/test-module-version').testModulesVersions;
var testPromise = testVersions(moduleVersions);
testPromise.then(function (results) {
    console.log('tested, results', results);
}, function (error) {
    console.error('failed', error);
});
*/

/*
var results = [ [ { name: 'lodash', version: '1.2.1', works: true } ],
  [ { name: 'async', version: '0.2.6', works: true },
  { name: 'async', version: '0.2.7', works: true },
  { name: 'async', version: '0.2.8', works: true },
  { name: 'async', version: '0.2.9', works: false } ] ];
report(results);
*/