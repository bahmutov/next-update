path = require 'path'
q = require 'q'
_ = require 'lodash'
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
  promise.catch -> gt.ok false, 'promise failed'
  promise.finally -> gt.start()
, TWO_MINUTES

# [ [ { name: 'check-types', version: '1.1.1', works: false } ] ]
gt.async 'results format', ->
  opts =
    module: 'check-types'
    latest: true
  promise = nextUpdate(opts)
  gt.ok q.isPromise(promise), 'next update returns a promise'
  promise.then (result) ->
    console.log 'Finished with', result
    gt.array result, 'result should be an array'
    result = _.flatten result
    gt.length result, 1, 'single result'
    gt.object result[0], 'single result is an object'
    gt.equal result[0].name, 'check-types'
    gt.string result[0].version, 'has version string'
    gt.equal typeof result[0].works, 'boolean', 'has works property'
  promise.catch -> gt.ok false, 'promise failed'
  promise.finally -> gt.start()
, TWO_MINUTES

# gt.async 'check all', ->
#   opts =
#     module: 'check-types'
#   promise = nextUpdate(opts)
#   promise.then -> gt.ok true, 'everything is ok'
#   promise.catch -> gt.ok false, 'promise failed'
#   promise.finally -> gt.start()
# , TWO_MINUTES
