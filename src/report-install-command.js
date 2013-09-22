var check = require('check-types');
var _ = require('lodash');

function loadPackage() {
    var fs = require('fs');
    var txt = fs.readFileSync('./package.json', 'utf-8');
    var pkg = JSON.parse(txt);
    return pkg;
}

function saveOption(type) {
    var saveCommands = {
        dependencies: '--save',
        devDependencies: '--save-dev',
        peerDependencies: '--save-peer'
    }
    return saveCommands[type];
}

function splitByType(updates, pkg) {
    check.verifyArray(updates, 'expected array of updates');
    check.verifyObject(pkg, 'expected package object');

    var result = {
        dependencies: [],
        devDependencies: [],
        peerDependencies: []
    }

    updates.forEach(function (moduleList) {
        if (!moduleList.length) {
            return;
        }
        var moduleName = moduleList[0].name;
        check.verifyString(moduleName, 'missing module name');
        if (pkg.dependencies && pkg.dependencies[moduleName]) {
            result.dependencies.push(moduleList);
        } else if (pkg.devDependencies && pkg.devDependencies[moduleName]) {
            result.devDependencies.push(moduleList);
        } else if (pkg.peerDependencies && pkg.peerDependencies[moduleName]) {
            result.peerDependencies.push(moduleList);
        } else {
            throw new Error('Could not find dependency for ' + moduleName);
        }
    });
    return result;
}

function installCommand(updates) {
    check.verifyArray(updates, 'expected array of updates');
    if (!updates.length) {
        return;
    }

    var pkg = loadPackage();
    console.assert(pkg, 'could not load package.json');

    var updatesByDependencyType = splitByType(updates, pkg);
    console.assert(updatesByDependencyType, 'could not split updates by type');
    console.log('dep by type');
    console.log(JSON.stringify(updatesByDependencyType, null, 2));

    var cmd = '';
    var depCmd = installCommandType(updatesByDependencyType.dependencies, 'dependencies');
    var devCmd = installCommandType(updatesByDependencyType.devDependencies, 'devDependencies');
    var peerCmd = installCommandType(updatesByDependencyType.peerDependencies, 'peerDependencies');
    if (depCmd) {
        cmd += depCmd + '\n';
    }
    if (devCmd) {
        cmd += devCmd + '\n';
    }
    if (peerCmd) {
        cmd += peerCmd + '\n';
    }
    if (cmd) {
        return cmd;
    }
}

function installCommandType(updates, type) {
    check.verifyArray(updates, 'expected array of updates');
    if (!updates.length) {
        return;
    }
    check.verifyString(type, 'missing type');

    var saveCommand = saveOption(type);
    if (!saveCommand) {
        throw new Error('invalid dependency type ' + type);
    }
    var originalCmd = cmd = 'npm install ' + saveCommand;
    updates.forEach(function (moduleVersions) {
        var latestWorkingVersion = getLatestWorkingVersion(moduleVersions);
        if (latestWorkingVersion) {
            cmd += ' ' + latestWorkingVersion.name + '@' + latestWorkingVersion.version;
        }
    });

    if (originalCmd === cmd) {
        return;
    }

    return cmd;
}

function getLatestWorkingVersion(versions) {
    check.verifyArray(versions, 'expected array of versions');
    var working;
    versions.forEach(function (info) {
        check.verifyString(info.name, 'missing package name ' + info);
        if (info.works) {
            working = info;
        }
    });

    return working;
}

module.exports = installCommand;