// @ts-check
const snapShot = require('snap-shot')
const {filterFetchedVersions, hasVersions} = require('./registry')
const check = require('check-more-types')
const la = require('lazy-ass')

/* global describe, it */
describe('registry', () => {
  describe('filterFetchedVersions', () => {
    const foo = {
      name: 'foo',
      versions: ['1.0.0', '1.0.1']
    }
    const bar = {
      name: 'bar',
      versions: []
    }
    const baz = {
      name: 'baz',
      versions: ['3.0.0-alpha']
    }
    const available = [foo, bar, baz]

    it('detects empty array property', () => {
      la(check.array(bar.versions), 'has versions')
      la(!check.unempty(bar.versions), 'is empty', bar.versions)
    })

    it('hasVersions', () => {
      const filtered = available.filter(hasVersions)
      snapShot(filtered)
    })

    it('filters out empty versions', () => {
      const filtered = filterFetchedVersions(false, available)
      snapShot(filtered)
    })

    it('filters latest versions', () => {
      const filtered = filterFetchedVersions(true, available)
      snapShot(filtered)
    })

    it('filters out alpha releases', () => {
      // make sure to filter out alpha releases
      // after fetching
      // https://github.com/bahmutov/next-update/issues/106
      const filtered = filterFetchedVersions(false, available)
      snapShot(filtered)
    })
  })
})
