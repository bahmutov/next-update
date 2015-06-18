path = require 'path'
index = path.join __dirname, '../bin/next-update.js'
ONE_MINUTE = 60000
TWO_MINUTES = 120000
moduleName = 'check-types'

gt.module 'end 2 end tests',
  setup: ->
    process.chdir path.join(__dirname, 'test-next-updater')
  teardown: ->
    process.chdir __dirname

gt.async '--module', ->
    gt.exec 'node', [index, '--module', moduleName], 0
, ONE_MINUTE

gt.async '--available', ->
    gt.exec 'node', [index, '--available'], 0
, ONE_MINUTE

gt.async '--available ' + moduleName, ->
    gt.exec 'node', [index, '--available', moduleName], 0
, ONE_MINUTE

gt.async '--revert ' + moduleName, ->
    gt.exec 'node', [index, '--revert', '--module', moduleName], 0
, ONE_MINUTE

gt.async '--revert', ->
    gt.exec 'node', [index, '--revert'], 0
, TWO_MINUTES
