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

  test("- Starting tasks previously saved (and executing the 'hello' task 3 times)", function(done){
    this.timeout(1 * 60 * 1000 * 5); // 5 minutes
      
    var count = 0;

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

        var listener = function(type, pid, data){
 //         console.log(data.message);
          if(type == 'task_loop' && data.code === 0){

            if(count < 2){
              count++;
            }else{
              scheduler.removeTask('hello', function(){
                scheduler.removeListener('scheduler', listener);
                assert.ok(1);
                done(); 
              });
            }
  
          }
        };

        // add the listener. 
        scheduler.on('scheduler', listener);
      });

    });

  });
/*
  test('- add a new task', function(done){
    this.timeout(1 * 60 * 1000 * 15); // 15 minutes

    var task1Done = false;
    var task2Done = false;

    var listener = function(type, pid, data){
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
    }, "* * * * *", endDate);

    // add the second task after 4 minutes, with 2 minutes of delay and same endDate
    setTimeout(function(){
      scheduler.addTask('hello2', function(callback){
        console.log("Hello from hello2! "+new Date());
        callback();
      }, "*2 * * * *", endDate);
    }, (1*60*1000*4));


  });
*/
});
