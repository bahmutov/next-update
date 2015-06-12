gt.module 'filter allowed'

require 'lazy-ass'
check = require 'check-more-types'
filter = require '../filter-allowed-updates'

current =
  q: { name: 'q', version: '1.1.1' }
available = [ { name: 'q', versions: [ '2.0.2' ] } ]

gt.test 'allow major', ->
  options =
    allowed: 'major'
  allowed = filter current, available, options
  la(check.array(allowed), allowed)
  la(allowed.length == 1, allowed)
  la(allowed[0].name == 'q', allowed[0])

gt.test 'allow minor', ->
  options =
    allowed: 'minor'
  allowed = filter current, available, options
  la(check.array(allowed), allowed)
  la(allowed.length == 0, allowed, 'major update not allowed')

gt.test 'allow patch', ->
  options =
    allowed: 'patch'
  allowed = filter current, available, options
  la(check.array(allowed), allowed)
  la(allowed.length == 0, allowed, 'major update not allowed for patch')
