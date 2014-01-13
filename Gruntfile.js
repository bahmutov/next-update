/*global module:false*/
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      default: {
        src: [ "index.js", "src/*.js" ]
      }
    },
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
    },
    readme: {
      options: {
        readme: './docs/README.tmpl.md',
        docs: '.',
        templates: './docs'
      }
    }
  });

  var plugins = require('matchdep').filterDev('grunt-*');
  plugins.forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', ['deps-ok', 'jsonlint',
    'jshint', 'jshint-solid',
    'nice-package', 'complexity']);
};
