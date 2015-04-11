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
  
  setup(function(){
    // scheduler must be started.
    manager = new TaskManager();
    //manager.start();
  });

  test(' - add a task to be executed every second.', function(done){
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    manager.createOrUpdate('hello', '* * * * *', function(){ console.log("Hello World!!"); }, tomorrow);

    assert(manager.tasksData.hello.name == "hello", "The Task Data is not saved properly.");

    done();

  });

  /*test(' - update the cron string', function(done){
    // update a task with specific name. 
    // Change the dates to execute (every minute.)
    // check if file changes
    done();
  });*/

  /*test('remove task', function(done){
    // Remove the task from specific name.
    // check if task filename was removed.
    done();
  });*/
});
