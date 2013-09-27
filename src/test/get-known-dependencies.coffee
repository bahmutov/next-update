gt.module 'handling npmrg vs git urls'

path = require 'path'
getDeps = require '../get-known-dependencies'

gt.test 'package with all npmrg', ->
    deps = getDeps path.join(__dirname, 'all-local-deps.json')
    gt.array deps, 'returns an array'
    gt.equal deps.length, 2, 'contains two items'

    gt.equal deps[0][0], 'foo', 'first item\'s name'
    gt.equal deps[0][1], '0.0.1', 'first item\'s version'

    gt.equal deps[1][0], 'bar', 'second item\'s name'
    gt.equal deps[1][1], '0.2.2', 'second item\'s version'

gt.skip 'package with urls', ->
    deps = getDeps path.join(__dirname, 'git-url-deps.json')
    gt.array deps, 'returns an array'
    console.dir deps;
    gt.equal deps.length, 2, 'contains two items'
