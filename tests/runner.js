var chai = require('chai');
var assert = chai.assert;

var TaskManager = require('../lib/TaskManager.js');
var TaskRunner = require('../lib/TaskRunner.js');

suite('TaskRunner tests', function(){
  var runner;
  var manager;
  var tomorrow;

  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    runner = new TaskRunner();
    manager = new TaskManager();
  });

  test('- if the task is executed 3 times.', function(done){
    // set timeout to delay
    var delayEndDate = 5 * 60 * 1000; // 5 minute in milisseconds
    this.timeout(delayEndDate);

    var count = 0;

    var runnerListener =  function(type, pid, data){
      if(type == "task_loop" && data.code === 0){

        if(count < 2){
          count++;
        }else{
          runner.stop('hello', function(){
            assert.ok(1);
            manager.remove('hello');
            runner.removeListener('runner', runnerListener);
            done();
          });
        }

      }
    };

    // implementing the listener for the TaskRunner
    runner.on('runner',runnerListener);

    // creating a task
    var name = "hello";
    var activity = function(callback){
     console.log("Hello World from hello (task runner)!!");
     callback();
    };
    var cronFreq = '0 * * * * *';

    var startDate = Date.now(); 
    var endDate = tomorrow;

    manager.createTask(name, activity, cronFreq, endDate, function(err, taskData){
     if(err) throw err;

     runner.startTask('hello');    
    }); 
    
  });
});
