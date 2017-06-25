var q = require('q')
q.longStackSupport = true

if (!module.parent) {
  throw new Error('Please run bin/next-update.js for stand alone CLI tool')
}

module.exports = require('./src/next-update-as-module')
