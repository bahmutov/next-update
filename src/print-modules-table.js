var verify = require('check-types').verify;
var Table = require('easy-table');

function printModulesTable(modules) {
    verify.array(modules, 'expect an array of modules');
    var haveSuccessNumbers = modules.some(function (m) {
        return typeof m.success === 'number';
    });

    var t = new Table();
    modules.forEach(function (info) {
        verify.string(info.name, 'missing module name ' + info);
        verify.string(info.version, 'missing module version ' + info);
        t.cell('package', info.name);
        t.cell('version', info.version);
        if (haveSuccessNumbers) {
            t.cell('average success %', info.success);
        }
        t.newRow();
    });
    console.log(t.toString());
}

module.exports = printModulesTable;
