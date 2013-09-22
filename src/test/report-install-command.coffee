gt.module 'report-install-command'

report = require '../report-install-command'

gt.test 'basics', ->
  gt.arity report, 1

gt.test 'expects an array', ->
  gt.raises ->
    report {name: 'foo', versions: [1]}
  , 'needs an array of objects'

gt.test 'empty input', ->
  cmd = report []
  gt.undefined cmd

gt.test 'nothing works', ->
  cmd = report [
    [
      name: 'foo'
      works: false
      version: 1
    ]
  ]
  gt.undefined cmd

gt.test 'single working', ->
  cmd = report [
    [
      name: 'foo'
      works: true
      version: '0.3.0'
    ]
  ]
  gt.ok /foo@0.3.0/.test(cmd), 'latest version'

gt.test 'usual input', ->
  cmd = report [
    [
      name: 'foo'
      works: true
      version: 1
    ,
      name: 'foo'
      works: true
      version: 2
    ,
      name: 'foo'
      works: true
      version: 3
    ]
  ]
  console.log cmd
  gt.ok /foo@3/.test(cmd), 'latest version is present'
  gt.ok !/foo@2/.test(cmd), 'previous version is not present'