moduleName = require '../moduleName'

gt.module 'module name parsing'

gt.test 'basic', ->
    gt.arity moduleName, 1

gt.test 'just name', ->
    nv = moduleName 'lodash'
    gt.object nv, 'returns an object'
    gt.equal nv.name, 'lodash'
    gt.undefined nv.version, 'has no version'

gt.test 'name with dashes', ->
    nv = moduleName 'lodash-one'
    gt.object nv, 'returns an object'
    gt.equal nv.name, 'lodash-one'
    gt.undefined nv.version, 'has no version'

gt.test 'name with dots', ->
    nv = moduleName 'lodash.one'
    gt.object nv, 'returns an object'
    gt.equal nv.name, 'lodash.one'
    gt.undefined nv.version, 'has no version'

gt.test 'name@version', ->
    nv = moduleName 'lodash@1'
    gt.object nv, 'returns an object'
    gt.equal nv.name, 'lodash'
    gt.equal nv.version, '1', 'has correct version'

gt.test 'name@version 3 digits', ->
    nv = moduleName 'lodash@1.0.1'
    gt.object nv, 'returns an object'
    gt.equal nv.name, 'lodash'
    gt.equal nv.version, '1.0.1', 'has correct version'

gt.test 'name@version 3 digits + rc', ->
    nv = moduleName 'lodash@1.0.1-rc1'
    gt.object nv, 'returns an object'
    gt.equal nv.name, 'lodash'
    gt.equal nv.version, '1.0.1-rc1', 'has correct version'

gt.test 'scoped name @author/name', ->
    nv = moduleName '@bahmutov/csv'
    gt.object nv, 'returns an object'
    gt.equal nv.name, '@bahmutov/csv'
    gt.undefined nv.version, 'has no version'

gt.test 'scoped name @author/name with version', ->
    nv = moduleName '@bahmutov/csv@1.1.0'
    gt.object nv, 'returns an object'
    gt.equal nv.name, '@bahmutov/csv'
    gt.equal nv.version, '1.1.0'
