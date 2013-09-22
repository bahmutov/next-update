var check = require('check-types');

// returns the string command
function installCommand(updates) {
  check.verifyArray(updates, 'expected array of updates');
  if (!updates.length) {
    return;
  }

  // todo: use correct dep type, not just all --save
  var cmd = 'npm install --save';
  updates.forEach(function (moduleVersions) {
    var latestWorkingVersion = getLatestWorkingVersion(moduleVersions);
    if (latestWorkingVersion) {
      cmd += ' ' + latestWorkingVersion.name + '@' + latestWorkingVersion.version;
    }
  });

  if ((/--save$/).test(cmd)) {
    // nothing works
    return;
  }

  return cmd;
}

function getLatestWorkingVersion(versions) {
  check.verifyArray(versions, 'expected array of versions');
  // assume versions are sorted, latest is last

  var working;
  versions.forEach(function (info) {
    if (info.works) {
      working = info;
    }
  });

  return working;
}

module.exports = installCommand;