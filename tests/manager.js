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

var TaskManager = require('../lib/TaskManager.js');
var TaskData = require('../lib/TaskData.js');

suite('TaskManager tests', function(){
  var manager; 
  var tomorrow;
  
  setup(function(){
    // cleaning the tasks dir
    f.rm(TaskData.getTasksDir());
    
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    manager = new TaskManager();

    // starting the pool of threds
    manager.start();
  });

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
    manager.createOrUpdate('hello2', '*/2 * * * *', function(){ assert.ok("hello2 executed."); }, tomorrow, false);
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

});
