var check = require('check-more-types')
var verify = check.verify
var spawn = require('child_process').spawn
var q = require('q')
var npmPath = require('./npm-test').npmPath
var _ = require('lodash')
const debug = require('debug')('next-update')

// returns a promise
// TODO switch to execa
function test (options, testCommand) {
  options = options || {}
  var log = options.tldr ? _.noop : console.log.bind(console)
  debug('exec-test "%s"', testCommand)

  verify.unemptyString(testCommand, 'missing test command string')
  log(' ', testCommand)

  var testParts = testCommand.split(' ')
  console.assert(testParts.length > 0, 'missing any test words in ' + testCommand)
  var testExecutable = testParts.shift()
  verify.unemptyString(testExecutable, 'missing test executable for command ' + testCommand)
  if (testExecutable === 'npm') {
    testExecutable = npmPath
  }
  var testProcess = spawn(testExecutable, testParts)
  var testOutput = ''
  var testErrors = ''

  testProcess.stdout.setEncoding('utf-8')
  testProcess.stderr.setEncoding('utf-8')

  testProcess.stdout.on('data', function (data) {
    testOutput += data
  })

  testProcess.stderr.on('data', function (data) {
    testErrors += data
  })

  var deferred = q.defer()
  testProcess.on('error', function (err) {
    console.error('test command: "' + testCommand + '"')
    console.error(err)
    testErrors += err.toString()
    const e = new Error('test command failed')
    e.code = err.code
    e.errors = testErrors
    deferred.reject(e)
  })

  testProcess.on('exit', function (code) {
    if (code) {
      console.error('testProcess test returned', code)
      console.error('test errors:\n' + testErrors)
      console.error(testOutput)
      const e = new Error('test exit code means error')
      e.code = code
      e.errors = testErrors
      return deferred.reject(e)
    }
    deferred.resolve()
  })
  return deferred.promise
}

module.exports = test
