#!/usr/bin/env node

var report = require('./src/report').report;
var pkg = require('./package.json');
var nextUpdate = require('./src/next-update');

var info = pkg.name + ' - ' + pkg.description + '\n' +
    '  version: ' + pkg.version + '\n' +
    '  author: ' + JSON.stringify(pkg.author);

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
        description: 'checks specific module, can include version name@version',
        default: false
    })
    .option('latest', {
        boolean: true,
        description: 'only check latest available update',
        default: false
    })
    .option('color', {
        boolean: true,
        alias: 'c',
        description: 'color terminal output (if available)',
        default: true
    })
    .option('version', {
        boolean: true,
        alias: 'v',
        description: 'show version and exit',
        default: false
    })
    .option('test', {
        string: true,
        alias: 't',
        description: 'custom test command to run instead of npm test'
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
    });
} else {
    var checkAllPromise = nextUpdate.checkAllUpdates(program.module,
        program.latest, program.test);

    checkAllPromise.then(function (results) {
        report(results, program.color);
    }, function (error) {
        console.error('ERROR testing next working updates\n', error);
        throw new Error(error);
    });
}