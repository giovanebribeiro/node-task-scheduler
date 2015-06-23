module.exports = function(grunt){
  [
    'grunt-contrib-jshint',
    'grunt-cafe-mocha',
    'grunt-bump',
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
      
      data:{
        src:['tests/data.js'],
        options:{ ui: 'tdd' }
      },

      manager:{
        src:['tests/manager.js'],
        options:{ ui: 'tdd' }
      },

      task:{
        src:['tests/task.js'],
        options:{ ui: 'tdd' }
      },

      runner: {
        src:['tests/runner.js'],
        options:{ ui: 'tdd' }
      },

      scheduler:{
        src:['tests/scheduler.js'],
        options:{ ui:'tdd' }
      },

      index:{
        src:['tests/index.js'],
        options:{ ui:'tdd' }
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
        commitFiles: ['package.json', 'CHANGELOG.md'],
        pushTo: 'origin'
      }
    },

  });

  grunt.registerTask('test', 'Make some tests', function(type){
    var tasks = ['jshint'];

    if(!type){
      type = "all";
    }

    switch(type){
      case 'basic':
        tasks.push('cafemocha:data');
        tasks.push('cafemocha:manager');
        break;
      case 'task':
        tasks.push('cafemocha:data');
        tasks.push('cafemocha:manager');
        tasks.push('cafemocha:task');
        break;
      case 'runner':
        tasks.push('cafemocha:data');
        tasks.push('cafemocha:manager');
        tasks.push('cafemocha:task');
        tasks.push('cafemocha:runner');
        break;
      case 'scheduler':
        tasks.push('cafemocha:data');
        tasks.push('cafemocha:manager');
        tasks.push('cafemocha:task');
        tasks.push('cafemocha:runner');
        tasks.push('cafemocha:scheduler');
        break;
      case 'all':
        tasks.push('cafemocha:data');
        tasks.push('cafemocha:manager');
        tasks.push('cafemocha:task');
        tasks.push('cafemocha:runner');
        tasks.push('cafemocha:scheduler');
        tasks.push('cafemocha:index');
        break;
      default:
        console.log(type+": unknown option. Use the following options to use this task:");
        console.log("* basic: Execute the basic set of tests (data and manager)");
        console.log("* task: Execute the set of tests for tasks (data, manager and task)");
        console.log("* runner: Execute the set of tests for task management (data, maager, task and runner)");
        console.log("* scheduler: Execute the set of tests for task scheduler (data, manager, task, runner, scheduler)");
        console.log("* all (default option): Execute all the tests, including the tests for index file.");
        break;
    }

    grunt.task.run(tasks);
  });
  
  grunt.registerTask('default', ['test']);

  grunt.registerTask('release', 'Generates the release of this project.', function(type){
    grunt.task.run([
      'test',
      'bump-only:' + (type || 'patch'),
      'changelog',
      'spawn:changelog',
      'bump-commit',
      'npm-publish'
      ]);
  });

};
