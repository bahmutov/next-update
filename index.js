#!/usr/bin/env node

var report = require('./src/report').report;
var package = require('./package.json');
var nextUpdate = require('./src/next-update');

var info = package.name + ' - ' + package.description + '\n' +
    '  version: ' + package.version + '\n' +
    '  author: ' + JSON.stringify(package.author);

var program = require('optimist')
    .options('revert', {
        boolean: true,
        description: 'install original module versions listed in package.json',
        default: false
    })
    .options('module', {
        string: true,
        alias: 'm',
        description: 'check only this module',
        default: false
    })
    .usage(info)
    .argv;

if (program.help) {
    console.log(info);
    process.exit(0);
}

/*
console.log(program);
process.exit(0);
*/

if (program.revert) {
    nextUpdate.revert(program.module)
    .then(function () {
        console.log('done reverting');
    }, function (error) {
        console.error('error while reverting\n', error);
    })
} else {
    var nextUpdatePromise = nextUpdate.check(program.module);

    nextUpdatePromise.then(function (results) {
        report(results);
    }, function (error) {
        console.error('ERROR testing next working updates\n', error);
        throw new Error(error);
    });
}
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