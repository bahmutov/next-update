const la = require('lazy-ass')
const is = require('check-more-types')
const R = require('ramda')

const name = 'next-update'

const getConfig = R.memoize(function getConfig (packageFilename) {
  la(is.unemptyString(packageFilename),
    'missing package filename', packageFilename)
  const pkg = require(packageFilename)
  const config = pkg &&
        pkg.config &&
        pkg.config[name]
  return config
})

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

function getTestCommand (packageFilename, moduleName) {
  la(is.unemptyString(moduleName), 'missing module name')
  const config = getConfig(packageFilename)
  if (!config) {
    return
  }
  if (!config.commands) {
    return
  }
  return config.commands[moduleName]
}

const stringify = (x) => JSON.stringify(x, null, 2)

const errorObject = (x) => (new Error(stringify(x)))

module.exports = {
  name,
  getConfig,
  getSkippedModules,
  getTestCommand,
  stringify,
  errorObject
}
