var la = require('lazy-ass')
var check = require('check-more-types')
var verify = check.verify
require('console.json')

var log = require('debug')('next-update')
var Q = require('q')
Q.longStackSupport = true
var depsOk = require('deps-ok')
var _ = require('lodash')

var nameVersionParser = require('./moduleName')
var registry = require('./registry')
var nextVersions = registry.nextVersions
var testVersions = require('./test-module-version').testModulesVersions
var runTest = require('./test-module-version').testPromise
var getDependenciesToCheck = require('./dependencies')
var reportAvailable = require('./report-available')
var npmUtils = require('npm-utils')

var boundConsoleLog = console.log.bind(console)

// returns a promise
function available (moduleName, options) {
  options = options || {}
  var toCheck = getDependenciesToCheck(options, moduleName)
  la(check.array(toCheck), 'expected object of deps to check, was', toCheck)
  var toCheckHash = _.zipObject(
        _.pluck(toCheck, 'name'),
        _.pluck(toCheck, 'version')
    )

  log('need to check these dependencies')
  log(toCheckHash)

  var nextVersionsPromise = nextVersions(options, toCheck)
  return nextVersionsPromise.then(function (info) {
    return reportAvailable(info, toCheckHash, options)
  }, function (error) {
    console.error('Could not fetch available modules\n', error)
  })
}

function checkDependenciesInstalled () {
  var defer = Q.defer()
  process.nextTick(function () {
    if (depsOk(process.cwd())) {
      defer.resolve()
    } else {
      var msg = 'Current installation is incomplete. Please run `npm install` or `bower install` first'
      defer.reject(new Error(msg))
    }
  })
  return defer.promise
}

function cleanDependencies () {
  var update = _.partial(npmUtils.test, 'npm update')
  var prune = _.partial(npmUtils.test, 'npm prune')
  return update().then(prune)
}

function checkCurrentInstall (options) {
  options = options || {}
  var log = options.tldr ? _.noop : boundConsoleLog
  log('checking if the current state works')

  return cleanDependencies()
        .then(checkDependenciesInstalled)
        .then(function () {
          log('running test command')
          return runTest(options, options.testCommand)()
        })
        .then(function () {
          console.log('> tests are passing at the start')
        })
}

var isOnline = Q.denodeify(require('is-online'))

function isSingleItem (names) {
  return names &&
        check.array(names) &&
        names.length === 1
}

function makeSureValidModule (moduleNames, checkingModules) {
  la(check.maybe.array(moduleNames), 'expected list of modules', moduleNames)
  la(check.array(checkingModules), 'expected list of modules to check', checkingModules)
  if (isSingleItem(moduleNames) && check.empty(checkingModules)) {
    console.error('Could not find module "%s" in the list of dependencies', moduleNames[0])
    console.error('Please check the name')
    process.exit(-1)
  }
}

// returns promise
function checkAllUpdates (options) {
  options = options || {}
  var moduleName = options.names
  var checkLatestOnly = !!options.latest
  var checkCommand = options.testCommand
  if (checkCommand) {
    verify.unemptyString(checkCommand, 'invalid test command ' + checkCommand)
  }
  var all = options.all
  if (all) {
    checkLatestOnly = true
    console.log('will check only latest versions because testing all')
  }

  if (check.string(options.without)) {
    options.without = [options.without]
  }

  if (check.string(moduleName)) {
    moduleName = [moduleName]
  }
  checkLatestOnly = !!checkLatestOnly
  if (checkCommand) {
    check.verify.string(checkCommand, 'expected string test command')
  }
  var toCheck = getDependenciesToCheck(options, moduleName)
  check.verify.array(toCheck, 'dependencies to check should be an array')

  makeSureValidModule(moduleName, toCheck)

  var testVersionsBound = testVersions.bind(null, {
    modules: toCheck,
    command: checkCommand,
    all: all,
    color: options.color,
    keep: options.keep,
    allowed: options.allow || options.allowed,
    tldr: options.tldr,
    type: options.type,
    limit: options.limit
  })

  return isOnline()
        .then(function (online) {
          // if (!online) {
          //   throw new Error('Need to be online to check new modules')
          // }
        }).then(function () {
          if (isSingleSpecificVersion(moduleName)) {
            var nv = nameVersionParser(moduleName[0])
            console.log('checking only specific:', nv.name, nv.version)
            var list = [{
              name: nv.name,
              versions: [nv.version]
            }]
            return testVersionsBound(list)
          } else {
            var nextVersionsPromise = nextVersions(options, toCheck, checkLatestOnly)
            return nextVersionsPromise.then(testVersionsBound)
          }
        })
}

function isSingleSpecificVersion (moduleNames) {
  if (!moduleNames) {
    return false
  }
  var name = moduleNames
  if (Array.isArray(moduleNames)) {
    if (moduleNames.length !== 1) {
      return false
    }
    name = moduleNames[0]
  }
  check.verify.string(name, 'expected module name string, not ' +
        JSON.stringify(name))
  var parsed = nameVersionParser(name)
  if (check.object(parsed)) {
    return false
  }
  return check.string(parsed.version)
}

module.exports = {
  checkCurrentInstall: checkCurrentInstall,
  checkAllUpdates: checkAllUpdates,
  available: available
}
