var verify = require('check-more-types').verify
var phin = require('phin')
var Q = require('q')
var colors = require('cli-color')
var colorAvailable = process.stdout.isTTY
const pluralize = require('pluralize')
const {oneLine} = require('common-tags')

var nextUpdateStatsUrl = require('../package.json')['next-update-stats'] ||
    'http://next-update.herokuapp.com'

function sendUpdateResult (options) {
  verify.unemptyString(options.name, 'missing name')
  verify.unemptyString(options.from, 'missing from version')
  verify.unemptyString(options.to, 'missing to version')
  if (options.success) {
    options.success = !!options.success
  }

  verify.webUrl(nextUpdateStatsUrl, 'missing next update stats server url')
  var sendOptions = {
    url: nextUpdateStatsUrl + '/update',
    method: 'POST',
    data: JSON.stringify(options)
  }
  phin(sendOptions)
}

function getSuccessStats (options) {
  verify.unemptyString(options.name, 'missing name')
  verify.unemptyString(options.from, 'missing from version')
  verify.unemptyString(options.to, 'missing to version')

  verify.webUrl(nextUpdateStatsUrl, 'missing next update stats server url')
  var opts = {
    url: nextUpdateStatsUrl + '/package/' + options.name + '/' + options.from +
            '/' + options.to,
    method: 'GET',
    data: JSON.stringify(options)
  }
  var defer = Q.defer()
  phin(opts, function (err, response) {
    var stats = response.body || null
    if (err || response.statusCode !== 200) {
      if (response) {
        if (response.statusCode !== 404) {
          console.error('could not get success stats for', options.name)
          console.error(opts)
        }
        console.error('response status:', response.statusCode)
      }
      if (err) {
        console.error(err)
      }
      defer.reject(err)
      return
    }
    defer.resolve(stats)
  })
  return defer.promise
}

function colorProbability (probability, options) {
  if (probability === null) {
    return ''
  }

  options = options || {}
  var useColors = !!options.color && colorAvailable
  if (probability < 0 || probability > 1) {
    throw new Error('Expected probability between 0 and 1, not ' + probability)
  }
  var probabilityStr = (probability * 100).toFixed(0) + '%'
  if (useColors) {
    if (probability > 0.8) {
      probabilityStr = colors.greenBright(probabilityStr)
    } else if (probability > 0.5) {
      probabilityStr = colors.yellowBright(probabilityStr)
    } else {
      probabilityStr = colors.redBright(probabilityStr)
    }
  }
  return probabilityStr
}

function formatStats (options, stats) {
  verify.object(stats, 'missing stats object')
  verify.unemptyString(stats.name, 'missing name')
  verify.unemptyString(stats.from, 'missing from version')
  verify.unemptyString(stats.to, 'missing to version')
  stats.success = +stats.success || 0
  stats.failure = +stats.failure || 0
  var total = stats.success + stats.failure
  var probability = (total > 0 ? stats.success / total : 0)
  var probabilityStr = colorProbability(probability, options)
  return oneLine`
    stats: ${stats.name} ${stats.from} -> ${stats.to}
    success probability ${probabilityStr}
    ${stats.success} ${pluralize('success', stats.success)}
    ${stats.failure} ${pluralize('failure', stats.failure)}
  `
}

function printStats (options, stats) {
  const message = formatStats(options, stats)
  console.log(message)
}

module.exports = {
  sendUpdateResult: sendUpdateResult,
  getSuccessStats: getSuccessStats,
  formatStats: formatStats,
  printStats: printStats,
  colorProbability: colorProbability,
  url: nextUpdateStatsUrl
}
