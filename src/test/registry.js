gt.module('registry fetchVersions');

var fetchVersions = require('../registry').fetchVersions;

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
        gt.ok(/not found/.test(error), 'error message gives a reason');
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