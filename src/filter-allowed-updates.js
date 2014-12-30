require('lazy-ass');
var check = require('check-more-types');
var semver = require('semver');

la(check.fn(semver.diff), 'semver missing diff method', semver);

function isDiffAllowed(allowed, diff) {
  la(check.unemptyString(allowed), 'invalid allowed update', allowed);
  la(check.unemptyString(diff), 'invalid diff update', diff);

  switch (allowed) {
    case 'major':
      return true;
    break;
    case 'minor':
      return diff === 'minor' || diff === 'patch';
    break;
    case 'patch':
      return diff === 'patch';
    break;
    default:
      throw new Error('Invalid allowed update ' + allowed);
    break;
  }
}

function filterAllowedUpdates(current, available, options) {
  var allowed = options.allow || options.allowed || 'major';
  var isAllowed = isDiffAllowed.bind(null, allowed);

  var filtered = available.filter(function (availableUpdate) {
    la(check.unemptyString(availableUpdate.name), 'missing name in available', availableUpdate);
    var fromVersion = current[availableUpdate.name];
    la(check.unemptyString(fromVersion), 'cannot find current version for', availableUpdate.name, current);

    var versions = availableUpdate.versions;
    la(check.array(versions), 'missing versions in update', availableUpdate);
    var filteredVersions = versions.filter(function (toVersion) {
      var diff = semver.diff(fromVersion, toVersion);
      // console.log(availableUpdate.name, 'difference from', fromVersion, 'to', toVersion, diff);
      return isAllowed(diff);
    });

    availableUpdate.versions = filteredVersions;
    return availableUpdate.versions.length > 0;
  });

  return filtered;
}

module.exports = check.defend(filterAllowedUpdates,
  check.object, 'expected object with all current dependencies',
  check.array, 'available list should be an array',
  check.object, 'options should be an object');
