gt.module 'using next-update as module'

nextUpdate = require '..'

gt.test 'basics', ->
  gt.func nextUpdate, 'next update is a function'

gt.async 'try updating', ->
  process.chdir '..'
  nextUpdate({ module: 'check-types' })
  .then -> console.log 'everything is ok'
  .failed -> gt.ok true, 'something failed'
  .finally ->
    process.chdir __dirname 
    gt.start()
, 60000