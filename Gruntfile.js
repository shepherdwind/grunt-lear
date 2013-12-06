/*
 * grunt-lear
 * https://github.com/eward/grunt-lear
 *
 * Copyright (c) 2013 shepherdwind
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['test/*/*.html.js'],
    },

    // Configuration to be run (and then tested).
    lear: {

      base: {
        expand: true,
        cwd: 'test/',
        src: '*/*.html'
      }

    }

  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['lear']);

};
