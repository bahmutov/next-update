const debug = require('debug')('next-update')
var getDependenciesToCheck = require('./dependencies')
var installModule = require('./module-install')
var q = require('q')

// returns promise
function revert (moduleName) {
  if (moduleName) {
    console.log('reverting module', JSON.stringify(moduleName))
  }

  var toCheck = getDependenciesToCheck({}, moduleName)
  debug('need to check')
  debug(toCheck)

  var installPromises = toCheck.map(function (info) {
    return installModule.bind(null, {
      name: info.name,
      version: info.version,
      tldr: false
    })
  })
  return installPromises.reduce(q.when, q())
}

module.exports = revert
