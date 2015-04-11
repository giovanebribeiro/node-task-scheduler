/*
 * Managing the tasks
 */

var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');
var debug = require('debug')('tests/manager');

var TaskManager = require('../lib/TaskManager.js');

suite('TaskManager tests', function(){
  var manager; 
  var tomorrow;
  
  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // scheduler must be started.
    manager = new TaskManager();
    //manager.start();
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
      manager.createOrUpdate("hello");
     }, Error, 'Insufficient parameters');

     // wrong type parameter
     assert.throws(function(){
      manager.createOrUpdate("hello", "* * * * *", "wrong type function", tomorrow);
     }, Error, "The task activity must be a function");


    // Create a new TaskData...
    manager.createOrUpdate('hello', '* * * * *', function(){ console.log("Hello World!!"); }, tomorrow);
    assert(manager.tasksSaved.hello.name == "hello", "The Task Data is not saved properly.");

    // ... update this object ..
    manager.createOrUpdate('hello', '*/2 * * * *');
    assert(manager.tasksSaved.hello.cron.string == '*/2 * * * *');

    // ... then remove it.
    manager.remove('hello');
    assert.isUndefined(manager.tasksSaved.hello, "The task is not removed.");
    done();

  });

});
