path = require 'path'
q = require 'q'
TWO_MINUTES = 120000

gt.module 'using next-update as module',
  setup: ->
    process.chdir path.join(__dirname, 'test-next-updater')
  teardown: ->
    process.chdir __dirname

nextUpdate = require '..'

gt.test 'basics', ->
  gt.func nextUpdate, 'next update is a function'

gt.async 'check latest only updating', ->
  opts =
    module: 'check-types'
    latest: true
  promise = nextUpdate(opts)
  gt.ok q.isPromise(promise), 'next update returns a promise'
  promise.then -> console.log 'everything is ok'
  promise.fail -> gt.ok false, 'promise failed'
  promise.finally -> gt.start()
, TWO_MINUTES

gt.async 'check all', ->
  opts =
    module: 'check-types'
  promise = nextUpdate(opts)
  promise.then -> gt.ok true, 'everything is ok'
  promise.fail -> gt.ok false, 'promise failed'
  promise.finally -> gt.start()
, TWO_MINUTES