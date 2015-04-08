/*
 * Managing the tasks
 */

var chai = require(chai);
var assert = chai.assert;

suite('Testing the task management', function(){
  setup(function(){
    // scheduler must be started.
  });

  test('add a task to be executed every second.', function(done){
    // create a json file with the task data 
    // (name, dates-array, end date and function to execute)
    // The task id is the task filename
    done();
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
