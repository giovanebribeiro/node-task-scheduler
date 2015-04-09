/*
 * File: tests/data.js
 * Author: Giovane Boaviagem
 *
 * Test suite for lib/TaskData file.
 */
var chai = require('chai');
var assert = chai.assert;
var f = require('../lib/util/file.js');

var TaskData = require('../lib/TaskData.js');

suite('TaskData.js tests', function(){
  setup(function(){
    // remove the tasks folder
    f.rm(TaskData.getTasksDir());
  });

  var tomorrow = new Date();
  tomorrow = tomorrow.setDate(tomorrow.getDate() + 1);
  var helloTask = new TaskData("hello", '* * * * *',function(){ 
    console.log("Hello World!!"); 
  }, tomorrow);


  test('if class is correct', function(done){
    assert(helloTask.name == "hello", "The task name is incorrect.");
    assert(helloTask.endDate == tomorrow, "The task end date should be: "+tomorrow.toString());
    assert(helloTask.activity() == "Hello World", "The task activity must print 'Hello World'");
    assert(helloTask.cron.next() instanceof Date, "The task cron iterator not working.");
    done();
  });


  test('if json task file exists', function(done){
    helloTask.toFile();
    assert(f.exists(helloTask.getTaskFilename()), "Task filename not exists.");
    assert(typeof f.read(helloTask.getTaskFilename()) == "string", "The task file content is incorrect");
    done();
  });

  test("if task data import works", function(done){
    var helloTask2 = TaskData.toTaskData("hello");
    assert(helloTask2.name == "hello", "The task name is incorrect.");
    assert(helloTask2.endDate == tomorrow, "The task end date should be: "+tomorrow.toString());
    assert(helloTask2.activity() == "Hello World", "The task activity must print 'Hello World'");
    assert(helloTask2.cron.next() instanceof Date, "The task cron iterator not working.");
    done();
  });


});
