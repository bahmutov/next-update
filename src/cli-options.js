var optimist = require('optimist');
var pkg = require('../package.json');

var info = pkg.name + ' - ' + pkg.description + '\n' +
    '  version: ' + pkg.version + '\n' +
    '  author: ' + JSON.stringify(pkg.author);

var program = optimist
.options('revert', {
  boolean: true,
  description: 'install original module versions listed in package.json',
  default: false
})
.options('available', {
  boolean: true,
  alias: 'a',
  description: 'only query available later versions, do not test them',
  default: false
})
.options('module', {
  string: true,
  alias: 'm',
  description: 'checks specific module, can include version name@version',
  default: null
})
.option('latest', {
  boolean: true,
  alias: 'l',
  description: 'only check latest available update',
  default: true
})
.option('color', {
  boolean: true,
  alias: 'c',
  description: 'color terminal output (if available)',
  default: true
})
.option('version', {
  boolean: true,
  alias: 'v',
  description: 'show version and exit',
  default: false
})
.option('test', {
  string: true,
  alias: 't',
  description: 'custom test command to run instead of npm test'
})
.option('skip', {
  boolean: true,
  description: 'skip running tests first',
  default: false
})
.option('all', {
  boolean: true,
  default: false,
  description: 'install all modules at once before testing'
})
.option('keep', {
  boolean: true,
  default: false,
  alias: 'k',
  description: 'keep tested version if it is working'
})
.option('allow', {
  string: true,
  default: 'major',
  description: 'allow major / minor / patch updates'
})
.options('type', {
  string: true,
  default: 'all',
  description: 'check dependencies of type (all, prod, dev, peer)'
})
.usage(info)
.argv;

if (program.version) {
  console.log(info);
  process.exit(0);
}

if (program.help || program.h) {
  optimist.showHelp();
  process.exit(0);
}

module.exports = program;
