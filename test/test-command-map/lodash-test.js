const _ = require('lodash')
console.log('lodash test version %s', _.VERSION)
process.exit(_.VERSION.startsWith('1.0') ? 0 : 1)
