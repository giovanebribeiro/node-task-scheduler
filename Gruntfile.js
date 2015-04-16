module.exports = function(grunt){
  [
    'grunt-contrib-jshint',
    'grunt-cafe-mocha'
  ].forEach(function(task){
    grunt.loadNpmTasks(task);
  });

  grunt.initConfig({
    jshint:{
      lib: ['lib/**/*.js'],
      qa: ['Gruntfile.js', 'tests/**/*.js']
    },

    cafemocha: {
      all: {
            src: [
                  'tests/data.js',
                  'tests/manager.js'
                 ], 
            options:{ 
              ui: 'tdd' 
            }, 
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'cafemocha']);
};
