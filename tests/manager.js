/*
 * Managing the tasks
 */

var chai = require('chai');
var assert = chai.assert;
var fs = require('fs');
var debug = require('debug')('tests:manager');

var TaskManager = require('../lib/TaskManager.js');

suite('Testing the task management', function(){
  setup(function(){
    // scheduler must be started.
  });

  var tm = new TaskManager();

  test('add a task to be executed every second.', function(done){
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    tm.create('hello', '* * * * *', function(){ console.log("Hello World!!"); }, tomorrow);
    debug("Tasks dir: ");
    debug(tm.getTasksDir());

    debug("check if file exists and if the task is running (after...)");

    var stats = fs.lstatSync(tm.getTasksDir()+"/hello.json");
    if(stats.isFile()){
      done();
    }
  });

  test('update a task', function(done){
    // update a task with specific name. 
    // Change the dates to execute (every minute.)
    // check if file changes
    done();
  });

  test('remove task', function(done){
    // Remove the task from specific name.
    // check if task filename was removed.
    done();
  });
});
