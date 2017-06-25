const path = require('path')
const fromFolder = path.join.bind(null, __dirname)
const chdir = require('chdir-promise')
const nextUpdate = require('..')
const execa = require('execa')
const snapShot = require('snap-shot')
const _ = require('lodash')
const is = require('check-more-types')
const la = require('lazy-ass')
const TWO_MINUTES = 120000

const index = fromFolder('../bin/next-update.js')
const testFolder = fromFolder('test-next-updater')

/* global describe, beforeEach, afterEach, it */
describe('--revert', () => {
  beforeEach(function () {
    return chdir.to(testFolder)
  })

  afterEach(chdir.back)

  it('--module check-types', function () {
    this.timeout(TWO_MINUTES)
    return execa('node', [index, '--revert', '--module', 'check-types'])
      .then(result => {
        la(result.code === 0, 'error exit',
          result.code, result.stdout, result.stderr)
      })
  })

  it('--module all', function () {
    this.timeout(TWO_MINUTES)
    return execa('node', [index, '--revert', '--module'])
      .then(result => {
        la(result.code === 0, 'error exit',
          result.code, result.stdout, result.stderr)
      })
  })
})
