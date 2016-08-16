'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const pause = 30*1000
const chdir = require('chdir-promise')
const join = require('path').join
const testFolder = join(__dirname, 'test-scoped-names')

describe('scoped packages', function () {
  const nextUpdate = require('../src/next-update')

  it('is an object', function () {
    la(is.object(nextUpdate))
  })

  it('has available method', function () {
    la(is.fn(nextUpdate.available))
  })

  it('handles scoped package names', function () {
    this.timeout(pause)
    return chdir.to(testFolder)
      .then(function () {
        return nextUpdate.available('@bahmutov/csv')
      })
      .then(function (available) {
        la(is.array(available), 'returns an array', available)
      })
      .then(chdir.back)
  })
})
