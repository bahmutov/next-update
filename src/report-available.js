var check = require('check-types');

// prints available module versions
function report(available) {
  check.verifyArray(available, 'expect an array of info objects');
  if (!available.length) {
    console.log('nothing new is available');
    return;
  }

  console.log('available versions');

  available.forEach(function (info) {
    check.verifyString(info.name, 'missing module name ' + info);
    check.verifyArray(info.versions, 'missing module versions ' + info);
    var sep = ', ';
    if (info.versions.length > 5) {
      sep = '\n  ';
    }
    console.log(info.name, ': ', info.versions.join(sep));
  });
}

module.exports = report;