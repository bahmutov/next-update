var nextUpdate = require('./next-update');

module.exports = function nextUpdateTopLevel(options) {
  options = options || {};
  var opts = {
    names: options.module,
    testCommand: options.test,
    latest: Boolean(options.latest),
    keep: Boolean(options.keep),
    color: Boolean(options.color || options.colors),
    allow: options.allow || options.allowed,
    type: options.type
  };

  var checkUpdates = nextUpdate.checkAllUpdates.bind(null, opts);

  return nextUpdate.checkCurrentInstall(opts)
    .then(checkUpdates);
};
