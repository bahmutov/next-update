gt.module('registry fetchVersions');

var fetchVersions = require('../registry').fetchVersions;

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