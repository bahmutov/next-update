const path = require('path')
const chdir = require('chdir-promise')
const nextUpdate = require('..')
const execa = require('execa')
const snapShot = require('snap-shot')
const R = require('ramda')
const TWO_MINUTES = 120000

const testFolder = path.join(__dirname, 'test-command-map')

function prune () {
  return execa.shell('npm prune')
}

function install () {
  return execa.shell('npm install')
}

const flatVersionSort = R.compose(
  R.sortBy(R.prop('version')),
  R.flatten
)

it('sorts by version', () => {
  const results = [
    [ { name: 'lodash', version: '1.0.1', from: '1.0.0', works: true },
  { name: 'lodash', version: '1.1.0', from: '1.0.0', works: false },
  { name: 'lodash', version: '1.1.1', from: '1.0.0', works: false },
  { name: 'lodash', version: '1.2.0', from: '1.0.0', works: false },
  { name: 'lodash', version: '1.2.1', from: '1.0.0', works: false },
  { name: 'lodash', version: '1.3.0', from: '1.0.0', works: false },
  { name: 'lodash', version: '1.3.1', from: '1.0.0', works: false },
  { name: 'lodash', version: '1.0.2', from: '1.0.0', works: true } ]
  ]
  snapShot(flatVersionSort(results))
})

/* global describe, beforeEach, afterEach, it */
describe('per-module configured command', () => {
  beforeEach(function () {
    this.timeout(TWO_MINUTES)
    return chdir.to(testFolder)
      .then(prune)
      .then(install)
  })

  afterEach(chdir.back)

  it('finds and uses module own test command', function () {
    this.timeout(TWO_MINUTES)
    const opts = {
      module: 'lodash',
      allow: 'minor'
    }
    return snapShot(nextUpdate(opts)
      .then(flatVersionSort))
  })
})
