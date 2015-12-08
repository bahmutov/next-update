var check = require('check-more-types');
var spawn = require('child_process').spawn;
var q = require('q');
var NPM_PATH = require('npm-utils').path;
var formInstallCommand = require('./report-install-command');

// returns a promise
function installModule(options, results) {
    check.verify.object(options, 'missing options');
    check.verify.string(options.name, 'expected module name string');
    check.verify.string(options.version, 'expected version string');

    if (options.keep) {
        console.assert(typeof options.keep === 'boolean', 'invalid keep');
    }
    if (results) {
        check.verify.array(results, 'missing results');
    }

    var cmd = formInstallCommand([[{
        name: options.name,
        version: options.version,
        works: true
    }]]);
    check.verify.unemptyString(cmd, 'could not form install command');
    cmd = cmd.trim();

    var moduleVersion = options.name + '@' + options.version, npm;
    if (options.keep) {
        console.log('  ', cmd);
        var args = cmd.split(' ');
        args.shift();
        args.push('--save-exact');
        npm = spawn(NPM_PATH, args);
    } else {
        if (!options.tldr) {
            console.log('  installing', moduleVersion);
        }
        npm = spawn(NPM_PATH, ['install', moduleVersion]);
    }

    var testOutput = '';
    var testErrors = '';

    npm.stdout.setEncoding('utf-8');
    npm.stderr.setEncoding('utf-8');

    function hasError(str) {
        return /error/i.test(str);
    }

    npm.stdout.on('data', function (data) {
        if (hasError(data)) {
            console.log('stdout:', data);
        }
        testOutput += data;
    });

    npm.stderr.on('data', function (data) {
        if (hasError(data)) {
            console.log('stderr:', data);
        }
        testErrors += data;
    });

    npm.on('error', function (err) {
        console.error('error:', err);
        testErrors += err.toString();
    });

    var deferred = q.defer();
    npm.on('exit', function (code) {
        if (code) {
            console.error('npm returned', code);
            console.error('errors:\n' + testErrors);
            deferred.reject({
                code: code,
                errors: testErrors
            });
        } else {
            if (!options.tldr) {
                console.log(moduleVersion, 'installed successfully');
            }
            deferred.resolve(results);
        }
    });
    return deferred.promise;
}

module.exports = installModule;
