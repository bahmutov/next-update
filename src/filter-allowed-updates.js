var la = require('lazy-ass')
var check = require('check-more-types')
var semver = require('semver')
var _ = require('lodash')
const R = require('ramda')
const debug = require('debug')('next-update')
const {isPrerelease} = require('./utils')

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

/*
update is an object like this
{
  name: 'check-types',
  versions: ['0.7.0', '0.7.1']
}
and limit function tells for each (name, version) if it should remain
in this list
*/
function limitUpdate (limit, update) {
  la(check.fn(limit), 'expected limit function', limit)

  const filter = R.filter(version => limit(update.name, version))

  return R.evolve({
    versions: filter
  })(update)
}

/*
update is an object like this
{
  name: 'check-types',
  versions: ['0.7.0', '0.7.1']
}
but the versions list could be empty
*/
function hasVersionsToCheck (update) {
  return check.object(update) && check.unempty(update.versions)
}

function filterAllowedUpdates (current, available, options) {
  var allowed = options.allow || options.allowed || 'major'
  var isAllowed = _.partial(isDiffAllowed, allowed)
  const limit = options.limit || R.T

  var type = options.type || 'all'
  var isAllowedType = _.partial(isDependencyTypeAllowed, type)

  const askLimit = _.partial(limitUpdate, limit)

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

    const filterByUpgradeType = _.partial(filterVersions, fromVersion)
    const notPrerelease = R.complement(isPrerelease)

    const filteredVersions = versions
      .filter(notPrerelease)
      .filter(filterByUpgradeType)

    availableUpdate.versions = filteredVersions
    return availableUpdate.versions.length > 0
  }

  debug('available updates')
  debug(available)

  const filtered = R.clone(available)
    .filter(filterHasNewVersions)
    .filter(allowedDependencyType)
    .map(askLimit)
    .filter(hasVersionsToCheck)

  debug('filtered updates')
  debug(filtered)

  return filtered
}

module.exports = check.defend(filterAllowedUpdates,
  check.object, 'expected object with all current dependencies',
  check.array, 'available list should be an array',
  check.object, 'options should be an object')
