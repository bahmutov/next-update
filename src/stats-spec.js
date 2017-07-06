// @ts-check
const snapShot = require('snap-shot')

/* global describe, it */
describe('stats', () => {
  describe('formatStats', () => {
    const {formatStats} = require('./stats')
    it('formats stats message', () => {
      const message = formatStats({}, {
        name: 'foo',
        from: '1.0.0',
        to: '2.0.0',
        success: 5,
        failure: 5
      })
      snapShot(message)
    })

    it('formats stats message with singular failure', () => {
      const message = formatStats({}, {
        name: 'foo',
        from: '1.0.0',
        to: '2.0.0',
        success: 1,
        failure: 1
      })
      snapShot(message)
    })
  })
})
