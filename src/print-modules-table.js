var check = require('check-types');
var Table = require('easy-table');

function printModulesTable(modules) {
    check.verifyArray(modules, 'expect an array of modules');
    var t = new Table();
    modules.forEach(function (info) {
        check.verifyString(info.name, 'missing module name ' + info);
        check.verifyString(info.version, 'missing module version ' + info);
        t.cell('package', info.name);
        t.cell('version', info.version);
        t.newRow();
    });
    console.log(t.toString());
}

module.exports = printModulesTable;
