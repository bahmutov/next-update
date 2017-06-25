const la = require('lazy-ass')
const is = require('check-more-types')

const name = 'next-update'

function getConfig (packageFilename) {
  la(is.unemptyString(packageFilename),
    'missing package filename', packageFilename)
  const pkg = require(packageFilename)
  const config = pkg &&
        pkg.config &&
        pkg.config[name]
  return config
}

module.exports = {
  name,
  getConfig
}
