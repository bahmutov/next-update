path = require 'path'
q = require 'q'
_ = require 'lodash'
TWO_MINUTES = 120000

gt.module 'output with newlines format',
  setup: ->
    process.chdir path.join(__dirname, 'test-next-updater')
  teardown: ->
    process.chdir __dirname

nextUpdate = require '..'

gt.async 'error reporting', ->
  opts =
    module: 'check-types'
    latest: true
  promise = nextUpdate(opts)
  gt.ok q.isPromise(promise), 'next update returns a promise'
  promise.then -> console.log 'everything is ok'
  promise.catch -> gt.ok false, 'promise failed'
  promise.finally -> gt.start()
, TWO_MINUTES
