const la = require('lazy-ass')
const snapShot = require('snap-shot')
const filter = require('./filter-allowed-updates')
const {clone, equals} = require('ramda')
const {isPrerelease} = require('./utils')

/* global describe, it, afterEach */
describe('filter allowed', () => {
  const current = {
    q: { name: 'q', version: '1.1.1', type: 'dev' }
  }
  const available = [ { name: 'q',
    versions: [ '1.3.0', '2.0.2', '3.0.0', '3.0.0-alpha', '3.0.0-rc0' ] } ]
  const copy = clone(available)

  afterEach(() => {
    // sanity check to make sure we are not
    // mutating the input objects
    la(equals(available, copy),
      'original available list is unchanged', available, copy)
  })

  it('detects prerelease', () => {
    snapShot(isPrerelease, '3.0.0-alpha', '3.0.0', '0.1.0', '10.0.0-beta.2')
  })

  it('allows major', () => {
    const options = {
      allowed: 'major'
    }
    const allowed = filter(current, available, options)
    snapShot({current, options, allowed})
  })

  it('allows minor', () => {
    const options = {
      allowed: 'minor'
    }
    const allowed = filter(current, available, options)
    snapShot({current, options, allowed})
  })

  it('allows patch', () => {
    const options = {
      allowed: 'patch'
    }
    const allowed = filter(current, available, options)
    snapShot({current, options, allowed})
  })

  it('allows everything by default', () => {
    const options = {}
    const allowed = filter(current, available, options)
    snapShot({current, options, allowed})
  })

  it('can custom filter', () => {
    const options = {
      limit: (name, version) => version === '2.0.2'
    }
    const allowed = filter(current, available, options)
    snapShot({current, options, allowed})
  })
})
