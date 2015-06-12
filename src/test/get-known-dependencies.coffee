gt.module 'handling npmrg vs git urls'

path = require 'path'
getDeps = require '../get-known-dependencies'

gt.test 'package with all npmrg', ->
    deps = getDeps path.join(__dirname, 'all-local-deps.json')
    gt.array deps, 'returns an array'
    gt.equal deps.length, 2, 'contains two items'

    gt.equal deps[0].name, 'foo', 'first item\'s name'
    gt.equal deps[0].version, '0.0.1', 'first item\'s version'
    gt.equal deps[0].type, 'prod'

    gt.equal deps[1].name, 'bar', 'second item\'s name'
    gt.equal deps[1].version, '0.2.2', 'second item\'s version'

gt.test 'package with urls', ->
    deps = getDeps path.join(__dirname, 'git-url-deps.json')
    gt.array deps, 'returns an array'
    console.dir deps;
    gt.equal deps.length, 1, 'contains single item'
    gt.equal deps[0].name, 'bar', 'public item name'
    gt.equal deps[0].version, '0.2.2', 'public item version'

