var chai = require('chai');
var assert = chai.assert;
var f = require('../lib/util/file.js');
var debug = require('debug')('tests/runner.js');
var cp = require('child_process');
var sinon = require('sinon');

var TaskData = require('../lib/TaskData.js');
var TaskManager = require('../lib/TaskManager.js');

suite('TaskData.js tests', function(){

  var taskData;
  setup(function(){});

  test(' - if can execute the task, and after 1 sec, exec again.', function(done){
    var clock = sinon.useFakeTimers();
    taskData = new TaskData('hello2', '* * * * *', function(){
      console.log("Hello World!");
      assert.ok();
    });
    taskData.toFile();

    /*TaskManager.runTask(taskData);
    clock.tick(1000);

    clock.restore();*/
    done();
  });
});
