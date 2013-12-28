var verify = require('check-types').verify;
var Table = require('easy-table');

function printModulesTable(modules) {
    verify.array(modules, 'expect an array of modules');
    var haveStats = modules.some(function (m) {
        return typeof m.stats === 'object';
    });

    var t = new Table();
    modules.forEach(function (info) {
        verify.string(info.name, 'missing module name ' + info);
        verify.string(info.version, 'missing module version ' + info);
        t.cell('package', info.name);
        t.cell('available', info.version);
        if (haveStats) {
            var stats = info.stats;
            verify.object(stats, 'expected stats object');

            t.cell('from version', stats.from);
            var total = +stats.success + stats.failure;
            var probability = total ? stats.success / total : 0;
            t.cell('average success %', probability * 100 + '%');
            t.cell('successful updates', info.stats.success);
            t.cell('failed updates', info.stats.failure);
        }
        t.newRow();
    });
    console.log(t.toString());
}

module.exports = printModulesTable;
