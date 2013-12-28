gt.module 'report-available'

report = require '../report-available'

gt.test 'number of arguments', ->
  gt.arity report, 2

gt.test 'expects an array', ->
  gt.raises ->
    report "info"
  , 'needs and array'

gt.test 'empty array', ->
  report []

gt.test 'good info', ->
  report [{name: 'test', versions: [1, 2]}]
  report [{name: 'test2', versions: ['1', '2']}]

gt.test 'missing module name', ->
  gt.raises ->
    report [{versions: [1,2]}]
  , 'needs module name'

gt.test 'lots of versions', ->
  report [{name: 'test', versions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}]
