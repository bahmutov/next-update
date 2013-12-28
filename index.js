#!/usr/bin/env node

var report = require('./src/report').report;
var pkg = require('./package.json');
var nextUpdate = require('./src/next-update');
var revert = require('./src/revert');

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
        default: null
    })
    .option('latest', {
        boolean: true,
        description: 'only check latest available update',
        default: true
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
    .option('all', {
        boolean: true,
        default: false,
        description: 'install all modules at once before testing'
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
    revert(program.module)
    .then(function () {
        console.log('done reverting');
    }, function (error) {
        console.error('error while reverting\n', error);
    });
} else {
    console.log(info);

    var updateNotifier = require('update-notifier');
    var notifier = updateNotifier();
    if (notifier.update) {
        notifier.notify();
    }

    var opts = {
        names: program.module,
        latest: program.latest,
        testCommand: program.test,
        all: program.all,
        color: program.color
    };

    nextUpdate.checkCurrentInstall(opts)
    .then(nextUpdate.checkAllUpdates.bind(null, opts))
    .then(function (results) {
        report(results, program.color);
    })
    .fail(function (error) {
        console.error('ERROR testing next working updates');
        console.error(error.stack);
        process.exit(1);
    });
}
