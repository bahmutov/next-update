'use strict'

var debug = require('debug')('next-update')
var la = require('lazy-ass')
var check = require('check-more-types')
var path = require('path')
var print = require('./print-modules-table')
var nameVersionParser = require('./moduleName')
var getKnownDependencies = require('./get-known-dependencies')
const {getConfig} = require('./utils')

require('console.table')
var _ = require('lodash')

la(check.fn(console.table), 'missing console.table method')
la(check.fn(console.json), 'missing console.json method')

// eslint-disable-next-line no-unused-vars
function printCurrentModules (infos) {
  check.verify.array(infos, 'expected array of modules')

  var modules = []
  infos.forEach(function (nameVersionArray) {
    check.verify.array(nameVersionArray, 'expected name version in ' + modules)
    modules.push({
      name: nameVersionArray[0],
      version: nameVersionArray[1]
    })
  })
  print(modules)
}

function printTable (options, nameVersionPairs) {
  if (options.tldr) {
    return
  }

  var allowedType = options.type || 'all'
  var title = 'module\'s current dependencies:'
  var filtered = allowedType === 'all'
        ? nameVersionPairs
        : _.filter(nameVersionPairs, { type: allowedType })

  console.table(title, _.map(filtered, function (nameVersion) {
    return {
      module: nameVersion.name,
      version: nameVersion.version,
      type: nameVersion.type
    }
  }))
}

function getSkippedModules (packageFilename) {
  const config = getConfig(packageFilename)
  if (config) {
    return config.skip ||
            config.skipped ||
            config.lock ||
            config.locked ||
            config.ignore ||
            config.ignored ||
            []
  }
  return []
}

function remove (nameVersionPairs, skipModules) {
  check.verify.array(skipModules, 'expected list of modules to skip')
  return nameVersionPairs.filter(function (dep) {
    check.verify.unemptyString(dep.name, 'missing name for dependency')
    return !_.includes(skipModules, dep.name)
  })
}

function normalizeModuleNames (moduleNames) {
  if (!moduleNames) {
    return
  }
  console.log('returning dependencies for')
  console.dir(moduleNames)
  if (check.string(moduleNames)) {
    moduleNames = [moduleNames]
  }

  if (check.object(moduleNames)) {
    var names = Object.keys(moduleNames)
    moduleNames = names
  }

  check.verify.array(moduleNames, 'expected module names array ' +
        JSON.stringify(moduleNames))
  return moduleNames
}

function getDependenciesToCheck (options, moduleNames) {
  check.verify.object(options, 'missing options')
  debug('initial module names', moduleNames)
  moduleNames = normalizeModuleNames(moduleNames)
  debug('normalized module names', moduleNames)

  var workingDirectory = process.cwd()

  var packageFilename = path.join(workingDirectory, 'package.json')
  var nameVersionPairs = getKnownDependencies(packageFilename)

  var skipModules = getSkippedModules(packageFilename)
  check.verify.array(skipModules, 'expected list of skipped modules')
  if (skipModules.length) {
    if (!options.tldr) {
      console.log('ignoring the following modules', skipModules.join(', '))
    }
    nameVersionPairs = remove(nameVersionPairs, skipModules)
  }
  printTable(options, nameVersionPairs)

  var toCheck = nameVersionPairs
  if (moduleNames) {
    debug('matching module names', moduleNames)
    toCheck = nameVersionPairs.filter(function (nameVersion) {
      var name = nameVersion.name
      return moduleNames.some(function (aModule) {
        var moduleName = nameVersionParser(aModule).name
        return name === moduleName
      })
    })
    if (!options.tldr) {
      if (toCheck.length) {
        console.log('only checking modules')
        console.log(toCheck.map(function (m) {
          return m.name + '@' + m.version
        }))
      } else {
        console.log('Hmm, no modules to check')
        console.log('from initial list\n' +
                    JSON.stringify(nameVersionPairs, null, 2))
      }
    }
  }
  return toCheck
}

module.exports = getDependenciesToCheck
