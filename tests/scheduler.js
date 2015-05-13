var chai = require('chai');
var assert = chai.assert;

var TaskScheduler = require('../lib/TaskScheduler.js');
var TaskData = require('../lib/TaskData.js');

suite('TaskScheduler tests', function(){
  var tomorrow;
  var scheduler;

  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    scheduler = new TaskScheduler();
  });

  test("- Starting tasks previously saved and remove it", function(done){
    this.timeout(1 * 60 * 1000 * 5); // 5 minutes
    
    // create the task  
    var hello = new TaskData("hello", function(callback){ 
      console.log("Hello World!" + new Date());
      callback(); 
    }, '0 * * * * *', tomorrow);

    //save the task to file
    hello.toFile(function(err){
      if(err) throw err;

      //load the saved task
      scheduler.start(function(){
        console.log("Task Runner started.");

        assert(scheduler.isRunning('hello'), "The task previously saved is not running.");
        
        scheduler.removeTask('hello');
        
        setTimeout(function(){
          assert(!scheduler.isRunning('hello'), "The task is still running even after removes");
          assert(!scheduler.haveTask('hello'), "The task still exists in queue even after removes");
          done();
        }, 1*60*1000); // task delay

      });
    });

  });



  test('- add 2 new tasks (with different delays and same end dates) and waits to finish', function(done){
    this.timeout(1 * 60 * 1000 * 15 * 2); // 30 minutes

    var task1Done = false;
    var task2Done = false;

    var listener = function(type, pid, data){
      if(data.code === 0 || data.code === 2){
        console.log("["+type+" - "+data.task+"]", data.message);
      }

      if(type == 'task_exit' && data.task == 'hello'){
        task1Done = true;
      }

      if(type == 'task_exit' && data.task == 'hello2'){
        task2Done = true;
      }

      if(task1Done && task2Done){
        scheduler.removeListener('scheduler', listener);
        assert.ok(1);
        done();
      }
    };

    scheduler.on('scheduler', listener);
    
    var tenMinutesLater = Date.now() + (1*60*1000*10);
    var endDate = new Date(tenMinutesLater);

    //add the first task with 1 minute of delay
    scheduler.addTask('hello', function(callback){
      console.log("Hello from hello! " + new Date());
      callback();
    }, "0 * * * * *", endDate);

    // add the second task after 4 minutes, with 2 minutes of delay and same endDate
    setTimeout(function(){
      scheduler.addTask('hello2', function(callback){
        console.log("Hello from hello2! "+new Date());
        callback();
      }, "0 */2 * * * *", endDate);
    }, (1*60*1000*4));


  });


});
