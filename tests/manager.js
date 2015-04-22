/*
 * File: tests/manager.js
 * Author: Giovane Boaviagem
 *
 * Test suite for lib/TaskManager.js
 */

var chai = require('chai');
var assert = chai.assert;
var f = require('../lib/util/file.js');
var debug = require('debug')('tests/manager');
var sinon = require('sinon');
var async = require('async');

var TaskManager = require('../lib/TaskManager.js');
var TaskData = require('../lib/TaskData.js');

suite('TaskManager tests', function(){
  var manager; 
  var tomorrow;
  
  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    manager = new TaskManager();
  });

  test('- createTask() exceptions: no parameters', function(done){
    assert.throws(function(){
      manager.createTask();
    }, Error, 'The task name, and the activity are required');
    done();
  });
  

  test('- createTask() exceptions: task name with wrong type', function(done){
    assert.throws(function(){
      manager.createTask(12);
    }, Error, 'The task name must be a string');
    done();
  });

  test('- createTask() exceptions: task activity with wrong type', function(done){
    assert.throws(function(){
      manager.createTask("hello2", "print 'Hello World!'");
    }, Error, 'The task activity must be a function');
    done();
  });

 test('- if the task is created', function(done){
   manager.createTask("hello2", function(){console.log("Hello World!");}, undefined, tomorrow, false); 
   
   assert(manager.tasksSaved.hello2, "The task is not saved.");
   done();
 });

 test('- if test is updated', function(done){
  manager.updateTask('hello2', function(){console.log("Hello World!");}, '*/2 * * * *');

  assert(manager.tasksSaved.hello2.cron == "*/2 * * * *", "The task is not updated.");
  done();
 });

 test('- if tasks are loaded', function(done){
  // 1- create the tasks
  debug("Creating the tasks");
  var helloTask1 = new TaskData('helloTask1', function(){
    assert.ok(1);
  }, '* * * * *', tomorrow);
  
  var helloTask2 = new TaskData('helloTask2', function(){
    console.log("Hello World 2");
  }, '*/2 * * * *', tomorrow);
  
  var helloTask3 = new TaskData('helloTask3', function(){
    console.log("Hello World 3");
  }, '*/3 * * * *', tomorrow);

  //2 - Export them to file
  debug("Export the tasks");
  async.series([
    function(callback){
      helloTask1.toFile(function(err){
        callback(err);
      });
    },

    function(callback){
      helloTask2.toFile(function(err){
        callback(err);
      });
    },
    
    function(callback){
      helloTask3.toFile(function(err){
        callback(err);
      });
    },

  ], function(err){
    if(err) throw err;

    debug("Starting the pool of threads");
    var clock = sinon.useFakeTimers();
    manager.loadTasks(function(err, tasksSaved){
      if(err) throw err;

      assert(tasksSaved.helloTask3, "The tasks not initialized.");
      done();
    });
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
