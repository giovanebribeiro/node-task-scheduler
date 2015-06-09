module.exports = function(grunt){
  [
    'grunt-contrib-jshint',
    'grunt-cafe-mocha',
    'grunt-bump'
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

  });

  grunt.registerTask('install', 'install the project dependencies', function(){
    var exec = require('child_process').exec;

    var cb = this.async();

    exec('npm install', function(err, stdout, stderr){
      if(err) throw err;

      console.log(stdout);
      cb();
    });

  });

  grunt.registerTask('test', ['install', 'jshint', 'cafemocha']); 
  
  grunt.registerTask('test_runner', ['jshint', 'cafemocha:runner']);
//  grunt.registerTask('default', ['jshint', 'cafemocha']);
};
