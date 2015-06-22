/*
 * File: tests/data.js
 * Author: Giovane Boaviagem
 *
 * Test suite for lib/TaskData file.
 */
var chai = require('chai');
var assert = chai.assert;
var f = require('../lib/util/file.js');
require('../lib/util/date.js');
var TaskData = require('../lib/TaskData.js');
var path = require('path');

suite('TaskData.js tests', function(){
  var helloTask;
  var tomorrow;

  var tasksDir = path.join(__dirname, 'tasks');

  before(function(){
    if(!f.exists(tasksDir)){
      f.mkdir(tasksDir);
    } 
  });

  after(function(){ 
    f.rm(tasksDir);
  });

  setup(function(){
    tomorrow = new Date();
    tomorrow = tomorrow.setDate(tomorrow.getDate() + 1);
    helloTask = new TaskData("hello", function(){ 
      return "Hello World"; 
    }, '* * * * *', tomorrow, {hello: "world"});
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
    assert(helloTask.cron == "* * * * *", "The cron string is incorrect. Should be: '* * * * *'");
    done();
  });

  test("- if task activity returns 'Hello World'", function(done){
    assert(helloTask.activity() == "Hello World", "The task activity must print 'Hello World'");
    done();
  });

  test("- if task activity args contains a json: {hello: 'world'}", function(done){
    assert(helloTask.args.hello == "world", "The task activity not have the correct json object");
    done();
  });

  test('- if exported task file exists', function(done){
    helloTask.toFile(tasksDir, function(err){
      if(err) throw err;
    
      assert(f.exists(helloTask.getTaskDataFile(tasksDir)), "Task data file not exists.");
      helloTask.destroyFiles(tasksDir);
      done();
    });
  });

  test('- if exported task file content is a string', function(done){
     helloTask.toFile(tasksDir, function(err){
      if(err) throw err;

      f.read(helloTask.getTaskDataFile(tasksDir), function(err, data){
        if(err) throw err;

        assert(typeof data == "string", "the task file content type is incorrect");
        
        helloTask.destroyFiles(tasksDir);
        done();
      });
     });
  });

  test("- if imported task have correct property: 'name'", function(done){
    helloTask.toFile(tasksDir, function(err){
      if(err) throw err;

      TaskData.toTaskData(tasksDir, 'hello', function(taskData){  
        assert(taskData.name == "hello", "The task name is incorrect. It should be: 'hello'");
        helloTask.destroyFiles(tasksDir);
        done();
      });
    });  
  });


  test("- if imported task have correct property: 'endDate'", function(done){
    helloTask.toFile(tasksDir, function(err){
      if(err) throw err;

      TaskData.toTaskData(tasksDir, 'hello', function(taskData){
        assert(taskData.endDate.compare(new Date(tomorrow)), "The task end date should be: "+tomorrow.toString()+", and not "+taskData.endDate.toString());
        helloTask.destroyFiles(tasksDir);
        done();
      });
    });  
  });   
  
  test("- if imported task have correct property: 'cron.string'", function(done){
    helloTask.toFile(tasksDir, function(err){
      if(err) throw err;

      TaskData.toTaskData(tasksDir, 'hello', function(taskData){
        assert(taskData.cron == "* * * * *", "The cron string is incorrect. Should be: '* * * * *'");
        helloTask.destroyFiles(tasksDir);
        done();
      });
    });

  }); 
  
  /*
  test("- if imported task have correct property: 'cron.iterator'", function(done){
    helloTask.toFile(function(err){
      if(err) throw err;

      var helloTask2 = TaskData.toTaskData('hello');
        assert(helloTask2.cron.iterator.next() instanceof Date, "The task cron iterator not working.");

        helloTask.destroyFiles();
        done();
    });  
  });*/ 
  
  test("- if imported task have correct property: 'activity'", function(done){
    
    helloTask.toFile(tasksDir, function(err){
      if(err) throw err;

      TaskData.toTaskData(tasksDir, 'hello', function(taskData){
        assert(taskData.activity() == "Hello World", "The task activity must print 'Hello World'");
        helloTask.destroyFiles(tasksDir);
        done();
      });
    });

   test("if imported task have correct property: 'args'", function(done){
    helloTask.toFile(tasksDir, function(err){
      if(err) throw err;

      TaskData.toTaskData(tasksDir, 'hello', function(taskData){
        assert(taskData.args.hello == "world", "The task activity not have the correct JSON args");
        helloTask.destroyFiles(tasksDir);
        done();
      });
    });
   }); 

  }); 

});
