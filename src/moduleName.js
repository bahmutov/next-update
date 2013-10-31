var check = require('check-types');

function moduleName(str) {
    check.verify.string(str, 'expected string module name');

    var parts = str.split('@');
    return {
        name: parts[0],
        version: parts[1]
    };
}

module.exports = moduleName;
