// Generated on 2015-08-01 using
// generator-webapp 1.0.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required grunt tasks
  require('jit-grunt')(grunt, {
      useminPrepare: 'grunt-usemin'
  });

  // Configurable paths
  var config = {
    app: 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      less: {
        files: ['<%= config.app %>/less/{,*/}*.less'],
        tasks: ['less']
      },
      src: {
        files: ['<%= config.app %>/**/*.js'],
        tasks: ['browserify']
      },
      livereload: {
        options: {
          livereload: true
        },
        files: ['<%= config.dist %>/index.html', '<%= config.dist %>/**/*.js', '<%= config.dist %>/**/*.less']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeAttributeQuotes: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          // true would impact styles with attribute selectors
          removeRedundantAttributes: false,
          useShortDoctype: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.dist %>',
          src: '{,*/}*.html',
          dest: '<%= config.dist %>'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '{,*/}*.html',
            'images/**',
            'vendor/**',
            'menubar.js',
            'package.json'
          ]
        }]
      }
    },

    less: {
      main: {
        options: {
          compress: true
        },
        src: '<%= config.app %>/less/main.less',
        dest: '<%= config.dist %>/css/main.css'
      }
    },

    browserify: {
      dev: {
        options: {
          transform: ['uglifyify'],
          browserifyOptions: {
            ignoreMissing: true
          }
        },
        src: '<%= config.app %>/src/main.js',
        dest: '<%= config.dist %>/src/main.js'
      }
    }

  });

  grunt.registerTask('build', [
    'clean:dist',
    'less',
    'copy:dist',
    'browserify',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
