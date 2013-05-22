var request = require('request');
var check = require('check-types');
var _ = require('lodash');

var NPM_URL = 'http://registry.npmjs.org/';

// fetching versions inspired by
// https://github.com/jprichardson/npm-latest
function fetchVersions(name, callback) {
    console.log('fetching versions for', name);
    check.verifyString(name, 'missing name string');
    check.verifyFunction(callback, 'missing callback function');

    var url = NPM_URL + name;
    request(url, function (err, response, body) {
        if (err) {
            console.error("ERROR when fetching info for package", name);
            throw new Error(err.message);
        }

        var info = JSON.parse(body);
        if (info.error) {
            throw new Error('ERROR in npm info for ' + name + ' reason ' + info.reason);
        }
        var versions = info.time;
        // console.dir(versions);
        callback(null, {
            name: name,
            versions: Object.keys(versions)
        });
    });
}

module.exports = {
    allVersions: fetchVersions
};