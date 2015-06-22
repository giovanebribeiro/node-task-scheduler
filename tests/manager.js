/*
 * File: tests/manager.js
 * Author: Giovane Boaviagem
 *
 * Test suite for lib/TaskManager.js
 */
var chai = require('chai');
var assert = chai.assert;
var f = require('../lib/util/file.js');
var async = require('async');

var TaskData = require('../lib/TaskData.js');
var TaskManager = require('../lib/TaskManager.js');

suite('TaskManager tests', function(){
  var manager; 
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
    tomorrow.setDate(tomorrow.getDate() + 1);
    manager = new TaskManager(tasksDir);
  });

  test('- if the task is created', function(done){
    this.timeout(4000);

    var name = "hello";
    var args = {hello: 'world'};
    var activity = function(callback){
      console.log("Hello World from hello!!");
      callback();
    };
    var cronFreq = '0 * * * * *';
    var endDate = tomorrow;

    manager.createTask(name, args, activity, cronFreq, endDate, function(err, taskData){
     if(err) throw err;

     assert(manager.haveTask('hello'), "The task is not saved.");
     manager.clean(); // clean files.
     done();

   }); 
 });

 
 test('- if tasks are loaded.', function(done){
  // 1- create the tasks
  var hello = new TaskData('hello', function(callback){
    console.log("Hello World from helloTask1");
    callback();
  }, '0 * * * * *', tomorrow, {hello: 'world1'});
  
  var hello2 = new TaskData('hello2', function(callback){
    console.log("Hello World from hello2");
    callback();
  }, '0 */2 * * * *', tomorrow, {hello: 'world2'});
  
  var hello3 = new TaskData('hello3', function(callback){
    console.log("Hello World from hello3");
    callback();
  }, '0 */3 * * * *', tomorrow, {hello: 'world3'});

  //2 - Export them to file
  async.series([
    function(callback){
      hello.toFile(tasksDir, function(err){
        callback(err);
      });
    },

    function(callback){
      hello2.toFile(tasksDir, function(err){
        callback(err);
      });
    },
    
    function(callback){
      hello3.toFile(tasksDir, function(err){
        callback(err);
      });
    },

  ], function(err){
    if(err) throw err;

    manager.loadTasks(function(err, tasksSaved){
      if(err) throw err;

      assert(tasksSaved.hello && tasksSaved.hello2 && tasksSaved.hello3, "The tasks not initialized.");
      manager.clean();
      done();
    });
  });


 });

 test('- if task is removed.', function(done){
    var name = "hello";
    var args = {hello: 'world'};
    var activity = function(callback){
      console.log("Hello World from hello!!");
      callback();
    };
    var cronFreq = '0 * * * * *';
    var endDate = tomorrow;

    manager.createTask(name, args, activity, cronFreq, endDate, function(err, taskData){
     if(err) throw err;

     manager.remove('hello');
     assert(!manager.haveTask('hello'), "The task is not removed.");
     done();
   }); 
 });

});
