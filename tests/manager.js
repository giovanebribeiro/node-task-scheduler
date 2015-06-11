/*
 * File: tests/manager.js
 * Author: Giovane Boaviagem
 *
 * Test suite for lib/TaskManager.js
 */
var chai = require('chai');
var assert = chai.assert;
var f = require('../lib/util/file.js');
var async = require('async');

var TaskData = require('../lib/TaskData.js');
var TaskManager = require('../lib/TaskManager.js');

suite('TaskManager tests', function(){
  var manager; 
  var tomorrow;
  
  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    manager = new TaskManager();
  });


  test('- if the task is created', function(done){
    this.timeout(4000);

    var name = "hello";
    var args = {hello: 'world'};
    var activity = function(callback){
      console.log("Hello World from hello!!");
      callback();
    };
    var cronFreq = '0 * * * * *';
    var endDate = tomorrow;

    manager.createTask(name, args, activity, cronFreq, endDate, function(err, taskData){
     if(err) throw err;

     assert(manager.haveTask('hello'), "The task is not saved.");
     manager.clean(); // clean files.
     done();

   }); 
 });

 
 test('- if tasks are loaded.', function(done){
  // 1- create the tasks
  var hello = new TaskData('hello', function(callback){
    console.log("Hello World from helloTask1");
    callback();
  }, '0 * * * * *', tomorrow, {hello: 'world1'});
  
  var hello2 = new TaskData('hello2', function(callback){
    console.log("Hello World from hello2");
    callback();
  }, '0 */2 * * * *', tomorrow, {hello: 'world2'});
  
  var hello3 = new TaskData('hello3', function(callback){
    console.log("Hello World from hello3");
    callback();
  }, '0 */3 * * * *', tomorrow, {hello: 'world3'});

  //2 - Export them to file
  async.series([
    function(callback){
      hello.toFile(function(err){
        callback(err);
      });
    },

    function(callback){
      hello2.toFile(function(err){
        callback(err);
      });
    },
    
    function(callback){
      hello3.toFile(function(err){
        callback(err);
      });
    },

  ], function(err){
    if(err) throw err;

    manager.loadTasks(function(err, tasksSaved){
      if(err) throw err;

      assert(tasksSaved.hello && tasksSaved.hello2 && tasksSaved.hello3, "The tasks not initialized.");
      manager.clean();
      done();
    });
  });


 });

 test('- if task is removed.', function(done){
    var name = "hello";
    var args = {hello: 'world'};
    var activity = function(callback){
      console.log("Hello World from hello!!");
      callback();
    };
    var cronFreq = '0 * * * * *';
    var endDate = tomorrow;

    manager.createTask(name, args, activity, cronFreq, endDate, function(err, taskData){
     if(err) throw err;

     manager.remove('hello');
     assert(!manager.haveTask('hello'), "The task is not removed.");
     done();
   }); 
 });

  /*
  test(' - tasks CRUD', function(done){
    //
    // Testing the exceptions thrown
    // The assert.throws function have 3 parameters:
    // - The function to test, wrapped in another function to receive args
    // - The Error type
    // - The Error message, to compare.
 
    // no parameters
     assert.throws(function(){
       manager.createOrUpdate();
     }, Error,  'The task name is required, at least');

     // insufficient parameters for new task
     assert.throws(function(){
      manager.createOrUpdate("hello2");
     }, Error, 'Insufficient parameters');

     // wrong type parameter
     assert.throws(function(){
      manager.createOrUpdate("hello2", "* * * * *", "wrong type function", tomorrow);
     }, Error, "The task activity must be a function");


    // Create a new TaskData...
    manager.createOrUpdate('hello2', '* * * * *', function(){ assert.ok("hello2 executed."); }, tomorrow, false);
    assert(manager.tasksSaved.hello2.name == "hello2", "The Task Data is not saved properly.");

    // ... update this object ..
    manager.createOrUpdate('hello2', '* * * * *');
    assert(manager.tasksSaved.hello2.cron.string == '* * * * *');

    // ... then remove it.
    manager.remove('hello2');
    assert.isUndefined(manager.tasksSaved.hello2, "The task is not removed.");
    done();

  });

  test(" - manage threads", function(done){
    var clock = sinon.useFakeTimers();
    manager.createOrUpdate('hello3', '* * * * *', function(){
      console.log("Hello World!!");
      assert.ok("All fine.");
    });

    clock.tick(1000);
    manager.stop();
    done();
  });
  */

});
