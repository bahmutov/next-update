gt.module 'end 2 end tests'

path = require 'path'
index = path.join __dirname, '../index.js'
TIMEOUT = 60000

gt.async 'check optimist', ->
    gt.exec 'node', [index, '--module', 'optimist'], 0, 'optimist'
, TIMEOUT