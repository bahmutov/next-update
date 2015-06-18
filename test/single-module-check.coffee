path = require 'path'
index = path.join __dirname, '../bin/next-update.js'
TWO_MINUTES = 120000

gt.module 'single module check',
  setup: ->
    process.chdir path.join(__dirname, 'test-next-updater')
  teardown: ->
    process.chdir __dirname

gt.async '--skip -m check-types', ->
  gt.exec 'node', [index, '--skip', '--m check-types'], 0
, TWO_MINUTES
