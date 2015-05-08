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
    // in previously test case, the 'hello' task was created.
    scheduler.start(function(){
      console.log("Task Runner started.");

      var count = 0;

      scheduler.on('scheduler', function(type, pid, data){
        if(type == 'task_loop' && data.task == "hello" && data.code === 0){
          
          if(count < 2){
            count ++;
          }else{
            scheduler.remove('hello');
            assert.ok(1);
            done(); 
          }

        }
      });

    });
  
  });

  // test()...
});
