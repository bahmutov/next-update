gt.module 'npm test',
    setup: ->
        @dir = process.cwd()
        process.chdir __dirname
        console.log 'changed directory to', __dirname
    teardown: ->
        console.log 'restoring dir', @dir
        process.chdir @dir

localVersion = require '../local-module-version'

gt.test 'basics', ->
    gt.arity localVersion, 1, 'expects single argument'

gt.test 'fetch local version', ->
    version = localVersion 'sample-module'
    gt.string version, 'got back a string'
    gt.equal version, '1.0.8', 'got back correct value'