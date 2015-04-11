/*
 * File: tests/data.js
 * Author: Giovane Boaviagem
 *
 * Test suite for lib/TaskData file.
 */
var chai = require('chai');
var assert = chai.assert;
var f = require('../lib/util/file.js');
var debug = require('debug')('tests/data.js');

var TaskData = require('../lib/TaskData.js');

suite('TaskData.js tests', function(){
  setup(function(){
    // remove the tasks folder
    f.rm(TaskData.getTasksDir());
  });

  var tomorrow = new Date();
  tomorrow = tomorrow.setDate(tomorrow.getDate() + 1);
  var helloTask = new TaskData("hello", '* * * * *',function(){ 
    return "Hello World"; 
  }, tomorrow);


  test(' - if class is correct', function(done){
    assert(helloTask.name == "hello", "The task name is incorrect.");
    assert(helloTask.endDate == tomorrow, "The task end date should be: "+tomorrow.toString());
    assert(helloTask.activity() == "Hello World", "The task activity must print 'Hello World'");
    assert(helloTask.cron.iterator.next() instanceof Date, "The task cron iterator not working.");
    done();
  });


  test(' - if task data export/import works', function(done){
    helloTask.toFile();
    assert(f.exists(helloTask.getTaskDatafile()), "Task data file not exists.");
    assert(typeof f.read(helloTask.getTaskDatafile()) == "string", "The task file content is incorrect");
    assert(f.exists(helloTask.getTaskActivityFile()), "Task activity file not exists.");
    assert(typeof f.read(helloTask.getTaskActivityFile()) == "string", "The task activity file content is incorrect");
    
    var helloTask2 = TaskData.toTaskData("hello");
    assert(helloTask2.name == "hello", "The task name is incorrect.");
    assert(helloTask2.endDate.getTime() == tomorrow, "The task end date should be: "+tomorrow.toString());
    assert(helloTask2.cron.iterator.next() instanceof Date, "The task cron iterator not working.");
    assert(helloTask2.activity() == "Hello World", "The task activity must print 'Hello World'");

    done();
  });



});
