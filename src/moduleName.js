'use strict'

var check = require('check-more-types')

function isScopedName (str) {
  return str[0] === '@' && str.indexOf('/') !== -1
}

function parseScopedName (str) {
  var parsed = moduleName(str.substr(1))
  parsed.name = '@' + parsed.name
  return parsed
}

function moduleName (str) {
  check.verify.string(str, 'expected string module name')

  if (isScopedName(str)) {
    return parseScopedName(str)
  }

  var parts = str.split('@')
  return {
    name: parts[0],
    version: parts[1]
  }
}

module.exports = moduleName
