var check = require('check-types');
var Table = require('easy-table');

function printModulesTable(modules) {
    check.verify.array(modules, 'expect an array of modules');
    var t = new Table();
    modules.forEach(function (info) {
        check.verify.string(info.name, 'missing module name ' + info);
        check.verify.string(info.version, 'missing module version ' + info);
        t.cell('package', info.name);
        t.cell('version', info.version);
        t.newRow();
    });
    console.log(t.toString());
}

module.exports = printModulesTable;
