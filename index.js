#!/usr/bin/env node

var report = require('./src/report').report;
var package = require('./package.json');
var nextUpdate = require('./src/next-update');

var info = package.name + ' - ' + package.description + '\n' +
    '  version: ' + package.version + '\n' +
    '  author: ' + JSON.stringify(package.author);

var optimist = require('optimist');
var program = optimist
    .options('revert', {
        boolean: true,
        description: 'install original module versions listed in package.json',
        default: false
    })
    .options('available', {
        boolean: true,
        alias: 'a',
        description: 'only query available later versions, do not test them',
        default: false
    })
    .options('module', {
        string: true,
        alias: 'm',
        description: 'checks specific module, could be used multiple times',
        default: false
    })
    .option('latest', {
        boolean: true,
        description: 'only check latest available update',
        default: false
    })
    .option('version', {
        boolean: true,
        alias: 'v',
        description: 'show version and exit',
        default: false
    })
    .usage(info)
    .argv;

if (program.version) {
    console.log(info);
    process.exit(0);
}

if (program.help) {
    optimist.showHelp();
    process.exit(0);
}

if (program.available) {
    nextUpdate.available(program.module);
} else if (program.revert) {
    nextUpdate.revert(program.module)
    .then(function () {
        console.log('done reverting');
    }, function (error) {
        console.error('error while reverting\n', error);
    })
} else {
    var checkAllPromise = nextUpdate.checkAllUpdates(program.module, program.latest);

    checkAllPromise.then(function (results) {
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