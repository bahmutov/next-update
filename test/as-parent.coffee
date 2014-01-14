gt.module 'using next-update as module'

nextUpdate = require '..'

gt.test 'basics', ->
  gt.func nextUpdate, 'next update is a function'
