// how to time limit a promise?

var Q = require('q')
var started = +new Date()

console.stamp = function stamp () {
  var elapsed = +new Date() - started
  var messageArgs = ['at %d ms:', elapsed].concat(
    Array.prototype.slice.call(arguments, 0)
  )
  console.log.apply(console, messageArgs)
}

function onOk (value) {
  console.stamp('promise resolved ok', value)
}

function onError (value) {
  console.stamp('promise error with value', value)
}

// "normal" promise-returning function, knows nothing about the time limit
function longAction () {
  var deferred = Q.defer()

  console.stamp('started long-running promise')
  setTimeout(function () {
    console.stamp('resolving long-running promise with 42 after 1 second')
    return deferred.resolve(42)
  }, 1000)

  return deferred.promise
}

longAction()
  .timeout(400, 'timed out')
  .then(onOk, onError)
  .done()
