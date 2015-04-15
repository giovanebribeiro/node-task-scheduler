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
  var helloTask;
  var tomorrow;

  setup(function(){
    // remove the tasks folder
    f.rm(TaskData.getTasksDir());
  
    tomorrow = new Date();
    tomorrow = tomorrow.setDate(tomorrow.getDate() + 1);
    helloTask = new TaskData("hello", '* * * * *',function(){ 
      return "Hello World"; 
    }, tomorrow);
  });

  test('- if task name is correct', function(done){
    assert(helloTask.name == "hello", "The task name is incorrect. Should be: 'hello'");
    done(); 
  });

  test('- if task end date is equal to tomorrow', function(done){ 
    assert(helloTask.endDate == tomorrow, "The task end date should be: "+tomorrow.toString());
    done();
  });

  test("- if task cron string is: '* * * * *'", function(done){
    assert(helloTask.cron.string == "* * * * *", "The cron string is incorrect. Should be: '* * * * *'");
    done();
  });

  test(' - if cron-paser next date is a date object', function(done){
    assert(helloTask.cron.iterator.next() instanceof Date, "The task cron iterator not working.");
    done();
  });

  test("- if task activity returns 'Hello World'", function(done){
    assert(helloTask.activity() == "Hello World", "The task activity must print 'Hello World'");
    done();
  });

  test('- if exported task file exists', function(done){
    helloTask.toFile(function(err){
      if(err) throw err;
    
      assert(f.exists(helloTask.getTaskDataFile()), "Task data file not exists.");
      helloTask.destroyFiles();
      done();
    });
  });

  test('- if exported task file content is a string', function(done){
     helloTask.toFile(function(err){
      if(err) throw err;

      f.read(helloTask.getTaskDataFile(), function(err, data){
        if(err) throw err;

        assert(typeof data == "string", "the task file content type is incorrect");
        
        helloTask.destroyFiles();
        done();
      });
     });
  });

  test("- if imported task have correct property: 'name'", function(done){
    helloTask.toFile(function(err){
      if(err) throw err;

      TaskData.toTaskData('hello', function(err2, helloTask2){
        if(err2) throw err2;

        assert(helloTask2.name == "hello", "The task name is incorrect. It should be: 'hello'");
        
        helloTask.destroyFiles();
        done();
      });
    });  
  });


  test("- if imported task have correct property: 'endDate'", function(done){
    helloTask.toFile(function(err){
      if(err) throw err;

      TaskData.toTaskData('hello', function(err2, helloTask2){
        if(err2) throw err2;
       
        assert(helloTask.endDate == tomorrow, "The task end date should be: "+tomorrow.toString());

        helloTask.destroyFiles();
        done();
      });
    });  
  });   
  
  test("- if imported task have correct property: 'cron.string'", function(done){
    helloTask.toFile(function(err){
      if(err) throw err;

      TaskData.toTaskData('hello', function(err2, helloTask2){
        if(err2) throw err2;
       
        
        assert(helloTask.cron.string == "* * * * *", "The cron string is incorrect. Should be: '* * * * *'");
 

        helloTask.destroyFiles();
        done();
      });
    });  
  }); 
  
  test("- if imported task have correct property: 'cron.iterator'", function(done){
    helloTask.toFile(function(err){
      if(err) throw err;

      TaskData.toTaskData('hello', function(err2, helloTask2){
        if(err2) throw err2;
       
        assert(helloTask.cron.iterator.next() instanceof Date, "The task cron iterator not working.");

        helloTask.destroyFiles();
        done();
      });
    });  
  }); 
  
  test("- if imported task have correct property: 'activity'", function(done){
    helloTask.toFile(function(err){
      if(err) throw err;

      TaskData.toTaskData('hello', function(err2, helloTask2){
        if(err2) throw err2;
    
        assert(helloTask.activity() == "Hello World", "The task activity must print 'Hello World'");
       
        helloTask.destroyFiles();
        done();
      });
    });  
  }); 
  /*
  test(' - if task data export/import works', function(done){
    assert(f.exists(helloTask.getTaskActivityFile()), "Task activity file not exists.");
    assert(typeof f.read(helloTask.getTaskActivityFile()) == "string", "The task activity file content is incorrect");
    
    var helloTask2 = TaskData.toTaskData("hello");
    assert(helloTask2.endDate.getTime() == tomorrow, "The task end date should be: "+tomorrow.toString());
    assert(helloTask2.cron.iterator.next() instanceof Date, "The task cron iterator not working.");
    assert(helloTask2.activity() == "Hello World", "The task activity must print 'Hello World'");

    done();
  });
  */



});
