var chai = require('chai');
var assert = chai.assert;
var path = require('path');

var TaskScheduler = require('../lib/TaskScheduler.js');

var scheduler = require('../lib/scheduler.js');
suite('scheduler tests (index file)', function(){

  test("- init the framework and execute the 'start' function", function(done){
    var tasksDir = path.join(__dirname, 'tasks');

    var taskScheduler = scheduler.init({tasksDir: tasksDir});

    taskScheduler.start(function(err, taskNames){
      if(err) throw err;

      assert(!(scheduler instanceof Array), "The task names type is not an array.");
      done();
    });
  });
  
});
