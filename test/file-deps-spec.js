'use strict'

var la = require('lazy-ass')
var is = require('check-more-types')
var pause = 30 * 1000
var chdir = require('chdir-promise')
var join = require('path').join
var testFolder = join(__dirname, 'test-file-deps')

/* global describe, it */
describe('scoped packages', function () {
  var nextUpdate = require('../src/next-update')

  it('is an object', function () {
    la(is.object(nextUpdate))
  })

  it('has available method', function () {
    la(is.fn(nextUpdate.available))
  })

  it('handles file: package names', function () {
    this.timeout(pause)
    return chdir
      .to(testFolder)
      .then(function () {
        return nextUpdate.available()
      })
      .then(function (available) {
        console.log('available', available)
      })
      .then(chdir.back)
  })
})
