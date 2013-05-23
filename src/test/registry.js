gt.module('registry fetchVersions');

var fetchVersions = require('../registry').fetchVersions;

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
    }).fail(function (error) {
        throw new Error(error);
    }).fin(gt.start);
}, 30000);

gt.async('fetch async later versions', function () {
    gt.func(fetchVersions);
    gt.arity(fetchVersions, 1);
    var promise = fetchVersions(['async', '0.2.0']);
    gt.func(promise.then, 'return object has then method');
    promise.then(function (results) {
        gt.object(results, 'returns an object');
        gt.equal(results.name, 'async', 'correct name returned');
        gt.array(results.versions, 'has versions array');
        gt.ok(results.versions.length > 5, 'a few versions');
    }).fail(function (error) {
        throw new Error(error);
    }).fin(gt.start);
}, 30000);


gt.module('registry nextVersions');

var nextVersions = require('../registry').nextVersions;

gt.test('next versions basics', function () {
    gt.func(nextVersions);
    gt.arity(nextVersions, 1);
});

gt.async('fetch gt, async versions', function () {
    var promise = nextVersions([['gt', '0.5.0'], ['async', '0.2.0']]);
    gt.func(promise.then, 'return object has then method');
    promise.then(function (results) {
        gt.array(results);
        gt.equal(results.length, 2, 'two modules');
        gt.equal(results[0].name, 'gt');
        gt.equal(results[1].name, 'async');
        gt.equal(results[0].vesions[0], '0.5.1');
        gt.equal(results[1].vesions[0], '0.2.1');
    }).fail(function (error) {
        throw new Error(error);
    }).fin(gt.start);
}, 30000);