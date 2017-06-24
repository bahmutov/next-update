const path = require('path')
const chdir = require('chdir-promise')
const nextUpdate = require('..')
const execa = require('execa')
const snapShot = require('snap-shot')
const TWO_MINUTES = 120000

const testFolder = path.join(__dirname, 'test-next-updater')

function prune () {
  return execa.shell('npm prune')
}

function install () {
  return execa.shell('npm install')
}

/* global describe, beforeEach, afterEach, it */
describe.only('testing check-types', () => {
  beforeEach(function () {
    this.timeout(TWO_MINUTES)
    return chdir.to(testFolder)
      .then(prune)
      .then(install)
  })

  afterEach(chdir.back)

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
      limit
    }
    return snapShot(nextUpdate(opts))
  })
})
