var verify = require('check-more-types').verify;
var Table = require('easy-table');
var colorProbability = require('./stats').colorProbability;

function markProbability(val, width) {
    if (width === null) {
        return val;
    }
    return Table.padLeft(val, width);
}

function printModulesTable(modules, options) {
    verify.array(modules, 'expect an array of modules');
    var haveStats = modules.some(function (m) {
        return typeof m.stats === 'object';
    });

    var t = new Table();
    modules.forEach(function (info) {
        verify.string(info.name, 'missing module name ' + info);
        verify.string(info.version, 'missing module version ' + info);

        t.cell('package', info.name);
        t.cell('current', info.from);
        t.cell('available', info.version);

        if (haveStats && info.stats) {
            var stats = info.stats;
            verify.object(stats, 'expected stats object');

            var total = +stats.success + stats.failure;
            var probability = total ? stats.success / total : null;
            var probabilityStr = colorProbability(probability, options);
            t.cell('success %', probabilityStr, markProbability);
            t.cell('successful updates', info.stats.success, Table.Number(0));
            t.cell('failed updates', info.stats.failure, Table.Number(0));
        }
        t.newRow();
    });
    console.log(t.toString());
}

module.exports = printModulesTable;
