gt.module 'end 2 end tests'

path = require 'path'
index = path.join __dirname, '../index.js'
ONE_MINUTE = 60000
TWO_MINUTES = 120000

gt.async '--module optimist', ->
    gt.exec 'node', [index, '--module', 'optimist'], 0
, ONE_MINUTE

gt.async '--available', ->
    gt.exec 'node', [index, '--available'], 0
, ONE_MINUTE

gt.async '--available optimist', ->
    gt.exec 'node', [index, '--available', 'optimist'], 0
, ONE_MINUTE

gt.async '--revert optimist', ->
    gt.exec 'node', [index, '--revert', '--module', 'optimist'], 0
, ONE_MINUTE

gt.async '--revert', ->
    gt.exec 'node', [index, '--revert'], 0
, TWO_MINUTES