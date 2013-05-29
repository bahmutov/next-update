gt.module 'npm test',
    setup: ->
        @dir = process.cwd()
        process.chdir __dirname
        console.log 'changed directory to', __dirname
    teardown: ->
        console.log 'restoring dir', @dir
        process.chdir @dir

npmTest = require '../npm-test'
test = npmTest.test

ONE_MINUTE = 60000

onError = (error) ->
    throw new Error(error)

gt.test 'basics', ->
    gt.arity test, 0
    gt.string npmTest.npmPath, 'has npm path'

gt.async 'simple npm test', ->
    promise = test()
    gt.object promise
    promise.then ->
        gt.ok false, 'there should not be npm test'
    .fail ->
        gt.ok true, 'failed as expected'
    .fin ->
        gt.start()
, ONE_MINUTE