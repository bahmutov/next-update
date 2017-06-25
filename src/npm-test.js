'use strict'

var debug = require('debug')('next-update')
var check = require('check-more-types')
var spawn = require('child_process').spawn
var q = require('q')
var _ = require('lodash')

// hack to find npm bin script reliably
function findNpmPath () {
  var os = require('os')
  var type = os.type()
  return (/windows/gi).test(type) ? 'npm.cmd' : 'npm'
}

var NPM_PATH = findNpmPath()
debug('found npm path %s', NPM_PATH)

function argsToString (arrayLike) {
  return Array.prototype.slice.call(arrayLike, 0).join(' ')
}

function writeToStderr () {
  process.stderr.write(argsToString(arguments))
}

function writeToStdout () {
  process.stderr.write(argsToString(arguments))
}

// returns a promise
function test (options) {
  options = options || {}
  var log = options.tldr ? _.noop : writeToStdout
  var errorLog = options.tldr ? _.noop : writeToStderr
  log('  npm test')

  check.verify.string(NPM_PATH, 'missing npm path string')
  var npm = spawn(NPM_PATH, ['test'])
  var testOutput = ''
  var testErrors = ''

  npm.stdout.setEncoding('utf-8')
  npm.stderr.setEncoding('utf-8')

  npm.stdout.on('data', function (data) {
    testOutput += data
    log(data)
  })

  npm.stderr.on('data', function (data) {
    testErrors += data
    log(data)
  })

  npm.on('error', function (err) {
    errorLog(err)
    testErrors += err.toString()
  })

  var deferred = q.defer()
  npm.on('exit', function (code) {
    if (code) {
      errorLog('npm test returned', code, '\n')
      errorLog('test output:\n' + testOutput)
      errorLog('test errors:\n' + testErrors)

      const e = new Error('npm test exit code means error')
      e.code = code
      e.errors = testErrors

      deferred.reject(e)
    }
    deferred.resolve()
  })
  return deferred.promise
}

module.exports = {
  test: test,
  npmPath: findNpmPath()
}
