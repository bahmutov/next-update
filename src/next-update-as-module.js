const nextUpdate = require('./next-update')
const is = require('check-more-types')
const {T} = require('ramda')

module.exports = function nextUpdateTopLevel (options) {
  options = options || {}
  const opts = {
    names: options.module,
    testCommand: options.test,
    latest: Boolean(options.latest),
    keep: Boolean(options.keep),
    color: Boolean(options.color || options.colors),
    allow: options.allow || options.allowed,
    type: options.type,
    changedLog: options['changed-log'],
    limit: is.maybe.fn(options.limit) ? options.limit : T,
    without: options.without
  }

  const checkUpdates = nextUpdate.checkAllUpdates.bind(null, opts)

  return nextUpdate.checkCurrentInstall(opts)
    .then(checkUpdates)
}
