report = require '../report-install-command'
mockery = require 'mockery'

mockPackageJson = """
{
  "name": "next-update",
  "version": "0.0.4",
  "dependencies": {
    "optimist": "~0.6.0",
    "lodash": "~2.0.0",
    "check-types": "~0.6.4"
  },
  "devDependencies": {
    "grunt": "~0.4.1",
    "grunt-contrib-jshint": "~0.6.4",
    "grunt-bump": "0.0.11",
    "gt": "~0.8.10"
  },
  "peerDependencies": {
    "foo": "0.0.1"
  }
}
"""

fsMock =
  existsSync: (name) -> name == './package.json'
  readFileSync: (name, encoding) ->
    console.assert name == './package.json', 'invalid name ' + name
    mockPackageJson

mockery.registerMock 'fs', fsMock

gt.module 'report-install-command',
  setup: -> mockery.enable { useCleanCache : true }
  teardown: -> mockery.disable()


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

gt.test 'peer dependency command', ->
  cmd = report [
    [
      name: 'foo'
      works: true
      version: '0.3.0'
    ]
  ]
  gt.ok /--save-peer/.test(cmd), 'save peer dependency'

gt.test 'normal dependency command', ->
  cmd = report [
    [
      name: 'lodash'
      works: true
      version: '0.3.0'
    ]
  ]
  gt.ok /--save\ /.test(cmd), 'save normal dependency'

gt.test 'dev dependency command', ->
  cmd = report [
    [
      name: 'grunt'
      works: true
      version: '0.3.0'
    ]
  ]
  gt.ok /--save-dev\ /.test(cmd), 'save dev dependency'

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
  gt.ok /foo@3/.test(cmd), 'latest version is present'
  gt.ok !/foo@2/.test(cmd), 'previous version is not present'

gt.test 'normal and dev dependency command', ->
  cmd = report [
    [
      name: 'lodash'
      works: true
      version: '0.3.0'
    ],
    [
      name: 'grunt'
      works: true
      version: '0.3.0'
    ]
  ]
  console.log cmd
  gt.ok /--save lodash@0\.3\.0/.test(cmd), 'normal dependency'
  gt.ok /--save-dev grunt@0\.3\.0/.test(cmd), 'save dev dependency'