/*global module:false*/
module.exports = function (grunt) {
  require('time-grunt')(grunt);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    lineending: {
      index: {
        options: {
          eol: 'lf'
        },
        files: {
          'index.js': 'index.js'
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [ '*.js' ]
      }
    },
    jsonlint: {
      all: {
        src: ['*.json']
      }
    },
    complexity: {
      all: grunt.file.readJSON('complexity.json')
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
    },
    /* to bump version, then run grunt (to update readme), then commit
    grunt release
    */
    bump: {
      options: {
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['-a'], // '-a' for all files
        createTag: true,
        tagName: '%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin'
      }
    }
  });

  var plugins = require('matchdep').filterDev('grunt-*');
  plugins.forEach(grunt.loadNpmTasks);

  grunt.registerTask('pre-check', ['deps-ok', 'jsonlint',
    'jshint', 'jshint-solid',
    'nice-package', 'complexity']);
  grunt.registerTask('default', ['pre-check', 'lineending']);
  grunt.registerTask('release', ['bump-only:patch', 'readme', 'bump-commit']);
};
