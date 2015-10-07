var chai = require('chai');
var assert = chai.assert;

var TaskScheduler = require('../lib/TaskScheduler.js');
var TaskData = require('../lib/TaskData.js');
var f = require('../lib/util/file.js');

suite('TaskScheduler tests', function(){
  var tomorrow;
  var scheduler;
  
  var tasksDir = path.join(__dirname, 'tasks');

  before(function(){
    if(!f.exists(tasksDir)){
      f.mkdir(tasksDir);
    } 
  });

  after(function(){ 
    f.rm(tasksDir);
  });

  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    scheduler = new TaskScheduler(tasksDir);
  });

  test("- Starting tasks previously saved, execute during 4 minutes, and remove", function(done){
    this.timeout(1 * 60 * 1000 * 5 * 2); // 10 minutes
    
    // create the task  
    var hello = new TaskData("hello", function(args, callback){ 
      console.log("Hello World! " + new Date(), "args: ", args.hello);
      callback(); 
    }, '0 * * * * *', undefined, {hello: 'world'});

    //save the task to file
    hello.toFile(tasksDir, function(err){
      if(err) throw err;

      console.log("toFile executed.");

      //load the saved task
      scheduler.start(function(err, taskNames){
        if(err) throw err;
        
        assert(!(scheduler instanceof Array), "The task names type is not an array.");

        console.log("Task Runner started.", taskNames);
        
        assert(scheduler.isRunning('hello'), "The task previously saved is not running.");

        setTimeout(function(){
        
          scheduler.removeTask('hello', function(){
        
            setTimeout(function(){
              assert(!scheduler.isRunning('hello'), "The task is still running even after removes");
              assert(!scheduler.haveTask('hello'), "The task still exists in queue even after removes");
              done();
            }, 1*60*1000); // task delay

          });

        }, 1*60*1000*4);

      });
    });

  });



  test('- add 2 new tasks (with different delays and same end dates) and waits to finish', function(done){
    this.timeout(1 * 60 * 1000 * 15 * 2); // 30 minutes

    var task1Done = false;
    var task2Done = false;

    var listener = function(type, pid, data){
      /*
      if(data.code === 0 || data.code === 2){
        console.log("["+type+" - "+data.task+"]", data.message);
      }
      */

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
    scheduler.addTask('hello', {hello: 'world'}, function(args, callback){
      console.log("Hello from hello! " + new Date(), "ARGS: "+args.hello);
      callback();
    }, "0 * * * * *", endDate);

    // add the second task after 4 minutes, with 2 minutes of delay and same endDate
    setTimeout(function(){
      scheduler.addTask('hello2', {hello: 'world2'}, function(args, callback){
        console.log("Hello from hello2! "+new Date(), "ARGS: "+args.hello);
        callback();
      }, "0 */2 * * * *", endDate);
    }, (1*60*1000*4));


  });

  test("- add a task, and check the task list and count. Waits to finish.", function(done){
    this.timeout(150000);

    //creating the listener
    var listener = function(type, pid, data){
      if(type == 'task_exit'){
        scheduler.removeListener('scheduler', listener);
        done();
      }
    };


    var fiveSecondsLater = Date.now()+(60*1000*5);
    var endDate = new Date(fiveSecondsLater);

    scheduler.addTask("hello", {}, function(args, callback){
      console.log("Hello World!! ajhdcljabsdjcbasjldbc");
      callback();
    }, "* * * * * *", endDate);

    //after 2 sec, make the assert
    setTimeout(function(){
      var taskList = scheduler.listTasks();
      var count = scheduler.count();
      assert(taskList.length > 0, taskList+": The task list is incorrect.");
      assert(count === 1, count+": the count of tasks is incorrect");
    }, 2000);
  
  });

  test("- clean all tasks", function(done){
    this.timeout(150000);

    //creating the listener
    var listener = function(type, pid, data){
      if(type == 'task_exit'){
        console.log("task exit triggered.");
        scheduler.removeListener('scheduler', listener);
      }
    };

    //creating the task
    var tenSecondsLater = Date.now()+(60*1000*10);
    var endDate = new Date(tenSecondsLater);

    scheduler.addTask("hello", {}, function(args, callback){
      console.log("Hello World!! 1234567890");
      callback();
    }, "* * * * * *", endDate);

    //after 5 sec, make the assert
    setTimeout(function(){
      scheduler.clean();
      //after 2 seconds, to make time for task is over, check
      setTimeout(function(){ 
        var count = scheduler.count();
        assert(count === 0, count+": the clean function is not working!");
        done();
      }, 2000);
    }, 5000);

  });


});
