const path = require('path')
const chdir = require('chdir-promise')
const nextUpdate = require('..')
const execa = require('execa')
const snapShot = require('snap-shot')
const _ = require('lodash')
const is = require('check-more-types')
const la = require('lazy-ass')
const TWO_MINUTES = 120000

const testFolder = path.join(__dirname, 'test-next-updater')

function prune () {
  return execa.shell('npm prune')
}

function install () {
  return execa.shell('npm install')
}

/* global describe, beforeEach, afterEach, it */
describe('testing check-types', () => {
  beforeEach(function () {
    this.timeout(TWO_MINUTES)
    return chdir.to(testFolder)
      .then(prune)
      .then(install)
  })

  afterEach(function () {
    this.timeout(TWO_MINUTES)
    return chdir.to(testFolder)
      .then(prune)
      .then(install)
      .then(chdir.back)
  })

  it('checks latest check-types', function () {
    this.timeout(TWO_MINUTES)
    const opts = {
      module: 'check-types',
      latest: true,
      keep: false
    }
    const removeVersions = (results) => results.map(r => {
      la(is.semver(r.version), 'expected version', r)
      r.version = 'valid'
      return r
    })
    return snapShot(nextUpdate(opts)
      .then(_.flatten)
      .then(removeVersions)
    )
  })

  it('checks some versions of check-types', function () {
    this.timeout(TWO_MINUTES)

    const limit = (name, version) => {
      if (name === 'check-types' && version.startsWith('0.7')) {
        return true
      }
      return false
    }

    const opts = {
      module: 'check-types',
      keep: false,
      limit
    }
    return snapShot(nextUpdate(opts))
  })
})
