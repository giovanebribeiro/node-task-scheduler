var semver = require('semver');
var currentVersion = require('./package.json').version;

module.exports = function(grunt){
  [
    'grunt-contrib-jshint',
    'grunt-cafe-mocha',
    'grunt-bump',
    'grunt-prompt',
    'grunt-conventional-changelog',
    'grunt-spawn',
    'grunt-npm'
  ].forEach(function(task){
    grunt.loadNpmTasks(task);
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint:{
      grunt: 'Gruntfile.js',
      lib: ['lib/**/*.js'],
      qa: ['tests/**/*.js']
    },

    cafemocha: {
      all: {
            src: [
                  'tests/data.js',
                  'tests/manager.js',
                  'tests/task.js',
                  'tests/runner.js',
                  'tests/scheduler.js'
                 ], 

            options:{ 
              ui: 'tdd'
            }, 
      },

      runner: {
        src:[
              'tests/data.js',
              'tests/manager.js',
              'tests/task.js',
              'tests/runner.js'
            ],

        options:{
          ui: 'tdd'
        }
      }
    },

    changelog:{
      options:{
        file: "CHANGELOG.md"
      } 
    },

    spawn:{
      changelog:{
        command: 'vim',
        commandArgs: ['{0}'],
        pattern: __dirname+'/CHANGELOG.md',
        opts:{
          stdio: 'inherit'
        }
      }
    },

    bump:{
      options:{
        updateConfigs: ['pkg'],
        commitFiles: ['package.json', 'CHANGELOG.md']
      }
    },

  });

  grunt.registerTask('test', ['jshint', 'cafemocha']);
  
  grunt.registerTask('default', ['test']);

  grunt.registerTask('release', 'Generates the release of this project.', function(type){
    grunt.task.run([
      'bump-only:' + (type || 'patch'),
      'changelog',
      'spawn:changelog',
      'bump-commit',
      'npm-publish'
      ]);
  });
};
