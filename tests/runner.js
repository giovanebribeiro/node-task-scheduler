var chai = require('chai');
var assert = chai.assert;

var TaskManager = require('../lib/TaskManager.js');
var TaskRunner = require('../lib/TaskRunner.js');
var TaskConstraints = require('../lib/TaskConstraints.js');

suite('TaskRunner tests', function(){
  var runner;
  var manager;
  var tomorrow;

  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    manager = new TaskManager();
    runner = new TaskRunner(manager);
  });



  test('- if the task is executed 3 times and stops.', function(done){
    // set timeout to delay
    var delayEndDate = 7 * 60 * 1000; // 6 minutes in milisseconds
    this.timeout(delayEndDate);

    var count = 0;

    var runnerListener =  function(type, pid, data){
      if(type == "task_loop"){
        console.log("DATA CODE ", data.code);

        if(data.code < 90 || data.code > 99){ // 90 - 99 is the range of reserved exit codes

          console.log('count value: ', count);
          if(count < 2){
            count++;
          }else{
            console.log(" Stopping the task. count = "+count);
            runner.stop('hello');
         
            // only in the next delay, we can check if task will stop to execute.
            console.log("Waiting the next delay to check"); 
            setTimeout(function(){
              console.log("Checking..");
              assert(!runner.isRunning('hello'), "The task is still running after stops.");
              runner.removeListener('runner', runnerListener);
              return done();
            }, 2*60*1000);
          }

        }

      }

    };

    // implementing the listener for the TaskRunner
    runner.on('runner',runnerListener);

    // creating a task
    var name = "hello";
    var args = {hello: 'world'};
    var activity = function(args, callback){
     console.log("Hello World from hello (task runner)!!", "ARGS: "+args.hello);
     callback(null, 10);
    };
    var cronFreq = '0 * * * * *';

    var startDate = Date.now(); 
    var endDate = tomorrow;

    manager.createTask(name, args, activity, cronFreq, endDate, function(err, taskData){
     if(err) throw err;

     runner.startTask('hello');    
    }); 
    
  });


  test('- testing error codes.', function(done){
    var delayEndDate = 5 * 60 * 1000; // 5 min
    this.timeout(delayEndDate);

    var count = 0;
    var customExitCode = 10;

    var runnerListener = function(type, pid, data){
      if(type == 'task_exit'){
        assert(data.code === TaskConstraints.exit_codes.loop_ends, "The task not have the correct exit code when task ends");
        
        setTimeout(function(){
          runner.removeListener('runner', runnerListener);
          done();
        }, 1 * 60 * 1000);

      }else if(type == 'task_loop'){

        // 0 is the only exit code that not implies a loop.
        assert(data.code > 0, "The task not have the correct exit codes when task loops");

        // assert only to check if personalized exit code is correct.
        if( data.code < 90 && data.code > 99 ){
          assert(data.code === customExitCode, "The task not have the specified exit code");
        }

        
      }
    };


    // implementing the listener for the TaskRunner
    runner.on('runner',runnerListener);

    // creating a task
    var name = "hello2";
    var args = {hello: 'world2'};
    var activity = function(args, callback){
     console.log("Hello World from hello2 (task runner)!!", "ARGS: "+args.hello);
     callback(null, 10);
    };
    var cronFreq = '0 * * * * *';

    var startDate = Date.now(); 
    var endDate = new Date(startDate + (2 * 60 * 1000)); // the task will over in 2 minutes

    manager.createTask(name, args, activity, cronFreq, endDate, function(err, taskData){
     if(err) throw err;

     runner.startTask(name);    
    });

  });


});
