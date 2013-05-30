var check = require('check-types');
var fs = require('fs');
var path = require('path');

// sync returns version
function getLocalModuleVersion(name) {
    check.verifyString(name, 'missing name string');

    try {
        var filename = path.join('node_modules', name, 'package.json');
        var contents = fs.readFileSync(filename, 'utf-8');
        var pkg = JSON.parse(contents);
        return pkg.version;
    } catch (error) {
        console.error('could not fetch version for local module', name);
        console.error(error);
        return null;
    }
}

module.exports = getLocalModuleVersion;