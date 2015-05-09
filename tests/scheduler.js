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

        // add the listener. 
        scheduler.on('scheduler', function(type, pid, data){
          if(type == 'task_loop' && data.code === 0){

            console.log("count", count);
          
            if(count < 2){
              count++;
            }else{
              scheduler.removeTask('hello', function(){
                assert.ok(1);
                done(); 
              });
            }
  
          }
        });

      });

    });

  });

  // test()...
});
