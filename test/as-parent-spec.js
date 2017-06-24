const path = require('path')
const chdir = require('chdir-promise')
const nextUpdate = require('..')
const TWO_MINUTES = 120000

const testFolder = path.join(__dirname, 'test-next-updater')

describe.only('testing check-types', () => {
  beforeEach(() => {
    chdir.to(testFolder)
  })

  afterEach(chdir.back)

  it('checks some versions of check-types', function () {
    this.timeout(TWO_MINUTES)

    const opts = {
      module: 'check-types'
    }
    return nextUpdate(opts)
      .then(console.log)
  })
})
