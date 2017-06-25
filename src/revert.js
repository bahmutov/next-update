const debug = require('debug')('next-update')
const is = require('check-more-types')
const la = require('lazy-ass')
var getDependenciesToCheck = require('./dependencies')
var installModule = require('./module-install')
var q = require('q')

const isRevertInfo = is.schema({
  name: is.unemptyString,
  version: is.unemptyString
})

// returns promise
function revert (moduleName) {
  if (moduleName) {
    console.log('reverting module', JSON.stringify(moduleName))
  }

  var toCheck = getDependenciesToCheck({}, moduleName)
  debug('need to check')
  debug(toCheck)

  var installPromises = toCheck.map(function (info) {
    la(isRevertInfo(info), 'invalid revert info', info)
    return installModule.bind(null, {
      name: info.name,
      version: info.version,
      tldr: false
    })
  })
  return installPromises.reduce(q.when, q())
}

module.exports = revert
