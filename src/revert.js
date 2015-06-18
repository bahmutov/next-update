var getDependenciesToCheck = require('./dependencies');
var installModule = require('./module-install');
var q = require('q');

// returns promise
function revert(moduleName) {
    if (moduleName) {
        console.log('should revert', JSON.stringify(moduleName));
    }

    var toCheck = getDependenciesToCheck({}, moduleName);
    var installPromises = toCheck.map(function (nameVersion) {
        var name = nameVersion[0];
        var version = nameVersion[1];
        return installModule.bind(null, {
            name: name,
            version: version,
            tldr: false
        });
    });
    return installPromises.reduce(q.when, q());
}

module.exports = revert;
