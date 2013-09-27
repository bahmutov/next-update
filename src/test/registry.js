gt.module('registry fetchVersions');

var registry = require('../registry');
var fetchVersions = registry.fetchVersions;
var cleanVersions = registry.cleanVersions;

function onError(error) {
    throw new Error(error);
}

gt.test('basic of fetch', function () {
    gt.func(fetchVersions);
    gt.arity(fetchVersions, 1);
});

gt.async('fetch non existent module', 2, function () {
    var promise = fetchVersions(['this-module-should-not-exist-at-all', '0.2.0']);
    gt.func(promise.then, 'return object has then method');
    promise.then(function (results) {
        gt.ok(false, 'should not get success, results ' + JSON.stringify(results));
    }).fail(function (error) {
        var moduleNotFound = (/not found/).test(error);
        var cannotConnect = (/ENOTFOUND/).test(error);
        gt.ok(moduleNotFound || cannotConnect, 'error message gives a good reason,', error);
    }).fin(gt.start);
}, 30000);

gt.async('fetch gt later versions', function () {
    gt.func(fetchVersions);
    gt.arity(fetchVersions, 1);
    var promise = fetchVersions(['gt', '0.5.0']);
    gt.func(promise.then, 'return object has then method');
    promise.then(function (results) {
        gt.object(results, 'returns an object');
        gt.equal(results.name, 'gt', 'correct name returned');
        gt.array(results.versions, 'has versions array');
        gt.ok(results.versions.length > 5, 'a few versions');
    }).fail(onError).fin(gt.start);
}, 30000);

gt.async('fetch module later versions', function () {
    gt.func(fetchVersions);
    gt.arity(fetchVersions, 1);
    var promise = fetchVersions(['lodash', '0.7.0']);
    gt.func(promise.then, 'return object has then method');
    promise.then(function (results) {
        gt.object(results, 'returns an object');
        gt.equal(results.name, 'lodash', 'correct name returned');
        gt.array(results.versions, 'has versions array');
        gt.ok(results.versions.length > 5, 'a few versions');
    }).fail(onError).fin(gt.start);
}, 30000);

gt.module('registry nextVersions');

var nextVersions = require('../registry').nextVersions;

gt.test('next versions basics', function () {
    gt.func(nextVersions);
    gt.arity(nextVersions, 2);
});

gt.async('fetch gt, optimist versions', function () {
    var promise = nextVersions([['gt', '0.5.0'], ['lodash', '1.0.0']]);
    gt.func(promise.then, 'return object has then method');
    promise.then(function (results) {
        gt.array(results);
        gt.equal(results.length, 2, 'two modules');
        gt.equal(results[0].name, 'gt');
        gt.equal(results[1].name, 'lodash');
        gt.equal(results[0].versions[0], '0.5.1');
        gt.equal(results[1].versions[0], '1.0.1');
    }).fail(onError).fin(gt.start);
}, 30000);

gt.async('fetch latest version', function () {
    var onlyLatest = true;
    var promise = nextVersions([['gt', '0.5.0'], ['lodash', '1.0.0']], onlyLatest);
    gt.func(promise.then, 'return object has then method');
    promise.then(function (results) {
        gt.array(results);
        gt.equal(results.length, 2, 'two modules');
        gt.equal(results[0].name, 'gt');
        gt.equal(results[1].name, 'lodash');
        gt.equal(results[0].versions.length, 1);
        gt.equal(results[1].versions.length, 1);
    }).fail(onError).fin(gt.start);
}, 30000);

gt.async('fetch latest version two digits', function () {
    var onlyLatest = true;
    var promise = nextVersions([['mocha', '~1.8']], onlyLatest);
    gt.func(promise.then, 'return object has then method');
    promise.then(function (results) {
        gt.array(results);
        gt.equal(results.length, 1, 'single module');
        gt.equal(results[0].name, 'mocha');
        gt.equal(results[0].versions.length, 1);
    }).fail(onError).fin(gt.start);
}, 30000);

gt.test('clean versions, 2 digits', function () {
    gt.arity(cleanVersions, 1);
    var cleaned = cleanVersions([['mocha', '~1.8']]);
    gt.array(cleaned);
    gt.equal(cleaned.length, 1);
    gt.equal(cleaned[0][0], 'mocha', 'correct name');
    gt.string(cleaned[0][1], 'version is a string');
});

gt.test('clean two versions', function () {
    var input = [['gt', '0.5.0'], ['lodash', '1.0.0']];
    var cleaned = cleanVersions(input);
    gt.array(cleaned);
    // console.dir(cleaned);
    gt.equal(cleaned.length, 2);
    gt.string(cleaned[0][1], 'first module has string version');
    gt.string(cleaned[1][1], 'second module has string version');
});

gt.test('clean latest versions', function () {
    var input = [['gt', 'latest']];
    var cleaned = cleanVersions(input);
    gt.array(cleaned, 'got back an array');
    gt.equal(cleaned.length, 1);
    gt.string(cleaned[0][1], 'module has string version');
});

gt.test('clean version *', function () {
    var input = [['gt', '*']];
    var cleaned = cleanVersions(input);
    gt.array(cleaned);
    gt.equal(cleaned.length, 1);
    gt.string(cleaned[0][1], 'module has string version');
});

gt.module('isUrl');

var isUrl = registry.isUrl;

gt.test('isUrl positive', function () {
    var urls = [
        'https://github.com/bahmutov/qunit-promises.git#0.0.7',
        'git://github.com/bahmutov/qunit-promises.git',
        'http://github.com/bahmutov/qunit-promises.git#latest'
    ];
    urls.forEach(function (url) {
        gt.ok(isUrl(url), url);
    });
});

gt.test('isUrl negative', function () {
    var notUrls = ['latest', '0.1.0', '*', '~0.2.1'];
    notUrls.forEach(function (notUrl) {
        gt.ok(!isUrl(notUrl), notUrl);
    });
});
