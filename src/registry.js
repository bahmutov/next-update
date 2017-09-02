'use strict'

var la = require('lazy-ass')
var check = require('check-more-types')
var log = require('debug')('next-update')
const R = require('ramda')

var phin = require('phin')
var verify = check.verify
var semver = require('semver')
var q = require('q')
var localVersion = require('./local-module-version')
var isUrl = require('npm-utils').isUrl
var _ = require('lodash')
const {isPrerelease} = require('./utils')

var _registryUrl = require('npm-utils').registryUrl
la(check.fn(_registryUrl), 'expected registry url function')
var registryUrl = _.once(_registryUrl)

const notPrerelease = R.complement(isPrerelease)

function cleanVersion (version, name) {
  var originalVersion = version
  verify.unemptyString(version, 'missing version string' + version)
  verify.unemptyString(name, 'missing name string' + name)

  if (isUrl(version)) {
        // version = version.substr(version.indexOf('#') + 1);

        // hmm, because we don't have a way to fetch git tags yet
        // just skip these dependencies
    console.log('Cannot handle git repos, skipping', name, 'at', version)
    return
  }
  if (version === 'original' ||
        version === 'modified' ||
        version === 'created') {
    return
  }

  version = version.replace('~', '').replace('^', '')
  var twoDigitVersion = /^\d+\.\d+$/
  if (twoDigitVersion.test(version)) {
    version += '.0'
  }
  if (version === 'latest' || version === '*') {
    console.log('Module', name, 'uses version', version)
    console.log('It is recommented to list a specific version number')
    version = localVersion(name)
    if (!version) {
      version = '0.0.1'
    }
    console.log('module', name, 'local version', version)
  }
  try {
    version = semver.clean(version)
  } catch (err) {
    console.error('exception when cleaning version', version)
    return
  }
  if (!version) {
    log('could not clean version ' + originalVersion + ' for ' + name)
    return
  }
  console.assert(version, 'missing clean version ' + originalVersion + ' for ' + name)
  return version
}

// eslint-disable-next-line no-unused-vars
function cleanVersionPair (nameVersion) {
  check.verify.array(nameVersion, 'expected an array')
  console.assert(nameVersion.length === 2,
        'expected 2 items, name and version ' + nameVersion)
  var name = nameVersion[0]
  check.verify.string(name, 'could not get module name from ' + nameVersion)

  var version = nameVersion[1]
  check.verify.string(version, 'could not get module version from ' + nameVersion)
  version = cleanVersion(version, name)
  if (!version) {
    return
  }

  nameVersion[1] = version
  return nameVersion
}

function cleanVersionObject (info) {
  check.verify.object(info, 'expected info')
  var name = info.name
  check.verify.string(name, 'could not get module name from ' + info)

  var version = info.version
  check.verify.string(version, 'could not get module version from ' + info)
  version = cleanVersion(version, name)

  if (!version) {
    return
  }

  info.version = version
  return info
}

function cleanVersions (nameVersionPairs) {
  check.verify.array(nameVersionPairs, 'expected array')
  var cleaned = nameVersionPairs
        .map(cleanVersionObject)
        .filter(check.object)
  return cleaned
}

function formNpmErrorMessage (name, info) {
  var reason = info.reason || info.error || JSON.stringify(info)
  var str = 'ERROR in npm info for ' + name + ' reason ' + reason
  return str
}

function cleanVersionFor (name, version) {
  return cleanVersion(version, name)
}

function extractVersions (info) {
  if (info.time) {
    return Object.keys(info.time)
  }
  if (info.versions) {
    return Object.keys(info.versions)
  }
}

function is404 (response) {
  return response && response.statusCode === 404
}

function isNotFound (str) {
  var moduleNotFound = (/not found/).test(str)
  var cannotConnect = (/ENOTFOUND/).test(str)
  var errorInNpm = (/ERROR in npm/).test(str)
  var couldNotFetch = (/could not fetch/i).test(str)
  return moduleNotFound || cannotConnect || errorInNpm || couldNotFetch
}

// fetching versions inspired by
// https://github.com/jprichardson/npm-latest
// returns a promise
function fetchVersions (nameVersion) {
    // console.log(nameVersion);
    // TODO use check.schema
  check.verify.object(nameVersion, 'expected name, version object')
  var name = nameVersion.name
  var version = nameVersion.version
  check.verify.string(name, 'missing name string')
  check.verify.string(version, 'missing version string')

  var cleanVersionForName = _.partial(cleanVersionFor, name)
  function isLaterVersion (ver) {
    var later = semver.gt(ver, version)
    return later
  }

    // console.log('fetching versions for', name, 'current version', version);
  var MAX_WAIT_TIMEOUT = 25000
  var deferred = q.defer()

  function rejectOnTimeout () {
    var msg = 'timed out waiting for NPM for package ' + name +
            ' after ' + MAX_WAIT_TIMEOUT + 'ms'
    console.error(msg)
    deferred.reject(msg)
  }

  function escapeName (str) {
    return str.replace('/', '%2F')
  }

  registryUrl().then(function (npmUrl) {
    log('NPM registry url', npmUrl)
    la(check.webUrl(npmUrl), 'need npm registry url, got', npmUrl)

    npmUrl = npmUrl.replace(/^https:/, 'http:').trim()
    var url = npmUrl + escapeName(name)

        // TODO how to detect if the registry is not responding?

    log('getting url', url)
    phin(url, onNPMversions)
    var timer = setTimeout(rejectOnTimeout, MAX_WAIT_TIMEOUT)

    function onNPMversions (err, response) {
      var body = response.body || null
      log('got response for', url)
      clearTimeout(timer)

      if (err) {
        console.error('ERROR when fetching info for package', name)
        deferred.reject(err.message)
        return
      }

      if (is404(response)) {
        log('404 response for', url)
        deferred.resolve({
          name: name,
          versions: []
        })
        return
      }

      try {
        log('parsing response body')
        var info = JSON.parse(body)
        log('parsed response, error?', info.error)
        if (info.error) {
          log('error parsing\n' + body + '\n')
          var str = formNpmErrorMessage(name, info)
          console.error(str)

          if (isNotFound(info.error)) {
            deferred.resolve({
              name: name,
              versions: []
            })
            return
          }

          deferred.reject(str)
          return
        }
        log('extracting versions')
        var versions = extractVersions(info)
        log('%d versions', versions.length)

        if (!Array.isArray(versions)) {
          throw new Error('Could not get versions for ' + name +
                        ' from ' + JSON.stringify(info) +
                        ' response ' + JSON.stringify(response, null, 2))
        }

        var validVersions = versions.filter(cleanVersionForName)
        var newerVersions = validVersions.filter(isLaterVersion)
        log('%d valid versions', validVersions.length)
        if (validVersions.length) {
          log('last version %s', R.last(validVersions))
        }
        if (newerVersions.length) {
          log('%d newer versions', newerVersions.length)
          log('from %s to %s', R.head(newerVersions), R.last(newerVersions))
        }

        deferred.resolve({
          name: name,
          versions: newerVersions
        })
        return
      } catch (err) {
        console.error(err)
        deferred.reject('Could not fetch versions for ' + name)
      }
    }
  })

  return deferred.promise
}

const verboseLog = (options) => options.tldr ? _.noop : console.log

function logFetched (fetched) {
  fetched.forEach(individual => {
    log('%s - %d versions', individual.name, individual.versions.length)
  })
}

const hasVersions = nameNewVersions =>
  nameNewVersions &&
    check.array(nameNewVersions.versions) &&
    check.unempty(nameNewVersions.versions)

const filterVersions = R.evolve({
  versions: R.filter(notPrerelease)
})

function filterFetchedVersions (checkLatestOnly, results) {
  la(arguments.length === 2, 'expected two arguments', arguments)
  checkLatestOnly = Boolean(checkLatestOnly)
  check.verify.array(results, 'expected list of results')
  log('fetch all new version results')
  logFetched(results)

  let available = results
    .map(filterVersions)
    .filter(hasVersions)

  if (checkLatestOnly) {
    available = available.map(function (nameVersions) {
      if (nameVersions.versions.length > 1) {
        nameVersions.versions = nameVersions.versions.slice(-1)
      }
      return nameVersions
    })
  } else {
    verboseLog('checking ALL versions')
  }
  return available
}

// returns a promise with available new versions
function nextVersions (options, nameVersionPairs, checkLatestOnly) {
  check.verify.object(options, 'expected object with options')
  check.verify.array(nameVersionPairs, 'expected array')
  nameVersionPairs = cleanVersions(nameVersionPairs)

  var MAX_CHECK_TIMEOUT = 10000

  const verbose = verboseLog(options)
  verbose('checking NPM registry')

  var fetchPromises = nameVersionPairs.map(fetchVersions)
  var fetchAllPromise = q.all(fetchPromises)
        .timeout(MAX_CHECK_TIMEOUT, 'timed out waiting for NPM')

  return fetchAllPromise.then(
    _.partial(filterFetchedVersions, checkLatestOnly),
    q.reject
  )
}

module.exports = {
  isUrl,
  cleanVersion,
  cleanVersions,
  fetchVersions,
  nextVersions,
  filterFetchedVersions,
  hasVersions
}
