gt.module 'stats'

Q = require 'q'
stats = require '../stats'

timeout = 15000

gt.async 'get stats', ->
  gt.func stats.getSuccessStats
  opts =
    name: 'foo-does-not-exist'
    from: '1.0.0'
    to: '2.0.0'
  stats.getSuccessStats(opts)
  .then(-> gt.ok false, 'should not find nonexistent module')
  .finally(-> gt.start())
, timeout

gt.async 'bad request for stats', ->
  opts =
    name: 'foo-does-not-exist'
    from: '1.0'
    to: '2.0'
  stats.getSuccessStats(opts)
  .then(-> gt.ok false, 'should not find nonexistent module')
  .finally(-> gt.start())
, timeout
