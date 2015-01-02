#!/usr/bin/env node

var q = require('q');
q.longStackSupport =  true;

var nextUpdate = require('./src/next-update');
if (module.parent) {
  module.exports = function nextUpdateTopLevel(options) {
    options = options || {};
    var opts = {
      names: options.module,
      testCommand: options.test,
      latest: Boolean(options.latest),
      keep: Boolean(options.keep),
      color: Boolean(options.color || options.colors),
      allow: options.allow || options.allowed
    };

    return nextUpdate.checkCurrentInstall(opts)
      .then(nextUpdate.checkAllUpdates.bind(null, opts));
  };
} else {
  var program = require('./src/cli-options');

  var pkg = require('./package.json');
  var info = pkg.name + '@' + pkg.version + ' - ' + pkg.description;

  var report = require('./src/report').report;
  var revert = require('./src/revert');

  if (program.available) {
    nextUpdate.available(program.module, {
      color: program.color
    });
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
      color: program.color,
      keep: program.keep,
      allow: program.allowed || program.allow
    };

    var checkCurrent = nextUpdate.checkCurrentInstall.bind(null, opts);
    var checkCurrentState = program.skip ? q : checkCurrent;
    var checkUpdates = nextUpdate.checkAllUpdates.bind(null, opts);

    var reportTestResults = function (results) {
      if (Array.isArray(results)) {
        report(results, program.color, program.keep);
      }
    };

    checkCurrentState()
      .then(checkUpdates)
      .then(reportTestResults)
      .catch(function (error) {
        console.error('ERROR testing next working updates');
        console.error(error.stack);
        process.exit(1);
      });
  }
}
