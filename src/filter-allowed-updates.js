var la = require('lazy-ass')
var check = require('check-more-types')
var semver = require('semver')
var _ = require('lodash')

la(check.fn(semver.diff), 'semver missing diff method', semver)

function isDiffAllowed (allowed, diff) {
  la(check.unemptyString(allowed), 'invalid allowed update', allowed)
  la(check.unemptyString(diff), 'invalid diff update', diff)

  switch (allowed) {
    case 'major':
      return true
    case 'minor':
      return diff === 'minor' || diff === 'patch'
    case 'patch':
      return diff === 'patch'
    default:
      throw new Error('Invalid allowed update ' + allowed)
  }
}

function isDependencyTypeAllowed (allowed, current) {
  la(check.unemptyString(allowed), 'expected allowed string', allowed)
  la(check.unemptyString(current), 'expected current string', current)

  allowed = allowed.trim().toLowerCase()
  current = current.trim().toLowerCase()

  if (allowed === 'all') {
    return true
  }
  return allowed === current
}

function filterAllowedUpdates (current, available, options) {
  var allowed = options.allow || options.allowed || 'major'
  var isAllowed = _.partial(isDiffAllowed, allowed)

  var type = options.type || 'all'
  var isAllowedType = _.partial(isDependencyTypeAllowed, type)

  // console.log('filtering available updates', available);
  // console.log('current versions', current);

  function filterVersions (fromVersion, toVersion) {
    var diff = semver.diff(fromVersion, toVersion)
    // console.log(availableUpdate.name, 'difference from', fromVersion, 'to', toVersion, diff);
    return isAllowed(diff)
  }

  function allowedDependencyType (availableUpdate) {
    var dependency = current[availableUpdate.name]
    la(check.object(dependency),
      'cannot find dependency for update', availableUpdate, 'in', current)
    la(check.unemptyString(dependency.type),
      'missing type of update', dependency)
    return isAllowedType(dependency.type)
  }

  function filterHasNewVersions (availableUpdate) {
    la(check.unemptyString(availableUpdate.name), 'missing name in available', availableUpdate)

    var fromVersion = current[availableUpdate.name].version
    la(check.unemptyString(fromVersion),
        'cannot find current version for', availableUpdate.name, current)

    var versions = availableUpdate.versions
    la(check.array(versions), 'missing versions in update', availableUpdate)

    var filteredVersions = versions.filter(_.partial(filterVersions, fromVersion))
    availableUpdate.versions = filteredVersions
    return availableUpdate.versions.length > 0
  }

  var filtered = available
    .filter(filterHasNewVersions)
    .filter(allowedDependencyType)

  // console.log('filtered', filtered);
  return filtered
}

module.exports = check.defend(filterAllowedUpdates,
  check.object, 'expected object with all current dependencies',
  check.array, 'available list should be an array',
  check.object, 'options should be an object')
