gt.module 'end 2 end tests'

path = require 'path'
index = path.join __dirname, '../index.js'
TIMEOUT = 60000

gt.async '--module optimist', ->
    gt.exec 'node', [index, '--module', 'optimist'], 0
, TIMEOUT

gt.async '--available', ->
    gt.exec 'node', [index, '--available'], 0
, TIMEOUT

gt.async '--available optimist', ->
    gt.exec 'node', [index, '--available', 'optimist'], 0
, TIMEOUT

gt.async '--revert optimist', ->
    gt.exec 'node', [index, '--revert', '--module', 'optimist'], 0
, TIMEOUT

gt.async '--revert', ->
    gt.exec 'node', [index, '--revert'], 0
, TIMEOUT