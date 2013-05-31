/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    datetime: Date.now(),
    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      'default': {
        src: [ 'index.js', 'src/*.js' ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('default', ['jshint']);
};