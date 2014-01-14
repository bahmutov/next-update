path = require 'path'

gt.module 'using next-update as module',
  setup: ->
    process.chdir path.join(__dirname, 'test-next-updater')
  teardown: ->
    process.chdir __dirname

nextUpdate = require '..'

gt.test 'basics', ->
  gt.func nextUpdate, 'next update is a function'

gt.async 'try updating', ->
  nextUpdate({ module: 'check-types' })
  .then -> console.log 'everything is ok'
  .failed -> gt.ok true, 'something failed'
  .finally ->
    gt.start()
, 60000