/*global module:false*/
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: grunt.file.readJSON('jshint.json'),
    jsonlint: {
      all: {
        src: ['*.json']
      }
    },
    complexity: {
      default: grunt.file.readJSON('complexity.json')
    },
    'nice-package': {
      all: {
        options: {}
      }
    }
  });

  var plugins = require('matchdep').filterDev('grunt-*');
  plugins.forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', ['deps-ok', 'jsonlint',
    'jshint', 'jshint-solid',
    'nice-package', 'complexity']);
};
