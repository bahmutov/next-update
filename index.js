#!/usr/bin/env node

var path = require('path');
var _ = require('lodash');
var package = require('./package.json');

var info = package.name + ' - ' + package.description + '\n' +
    '  version: ' + package.version + '\n' +
    '  author: ' + JSON.stringify(package.author);

console.log(info);

/*
var program = require('optimist')
    .usage(info)
    .argv;

if (process.argv.length === 2) {
    console.log(info);
    process.exit(0);
}
*/

var workingDirectory = process.cwd();
console.log('working directory', workingDirectory);

var workingPackage = require(path.join(workingDirectory, 'package.json'));
var dependencies = workingPackage.dependencies || {};
var devDependencies = workingPackage.devDependencies || {};
_.extend(dependencies, devDependencies);
console.log('all dependencies\n', dependencies);