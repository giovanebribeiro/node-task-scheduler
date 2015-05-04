/*
 * File: lib/TaskRunner.js
 * Author: Giovane Boaviagem
 *
 * Executes the Task with fork.
 */
(function(){
'use strict';

var cp = require('child_process');
var events = require('events');
var util = require('util');
var path = require('path');
var TaskData = require('./TaskData.js');
require('./util/date.js');
var cronParser = require('cron-parser');
var forever = require('forever-monitor');

var TaskRunner;

module.exports = TaskRunner = function(taskManager){
  this.threads = {};
  this.manager = taskManager;
};

util.inherits(TaskRunner, events.EventEmitter);

TaskRunner.prototype.createChild = function(taskName){
  var debug = require('debug')('lib/TaskRunner.js:createChild()');
  var that = this;

  debug("Creating the listeners");
  
  var onStdout = function(m){
    that.emit('stdout', m.toString('utf-8')); 
  };
  var onStop = function(err){
    this.kill(); // stops the process.
  };
  var onExit = function(){
    process.nextTick(function(){
      that.emit('task_end', "The task "+taskName+" is over.");
      debug("Deleting the old child process.");
      delete that.threads[taskName];
      if(that.manager.tasksSaved[taskName]){
        debug("Creating the new child process, with updated delay.");
        var child2 = that.createChild(taskName);
        debug("Task created.");
      }
    });
  }

  debug("Creating the child");

  var childOptions = {
    max: 1,
    silent:true,
    args: [taskName]
  };

  var child = new (forever.Monitor)(path.join(__dirname, path.sep, 'Task.js'), childOptions);
  child.on('stdout', onStdout);
  child.on('stop', onStop);
  child.on('exit', onExit);
  
  debug("Updating the new child in threads array");
  that.threads[taskName] = child;

  // receives the messages from the child
  process.on("message", function(data){
    console.log(data);
  });

  debug("starting the child");
  child.start();
  return child; 
};

TaskRunner.prototype.start = function(taskName){
  var debug = require('debug')('lib/TaskRunner:start');
 
  debug("Starting task", taskName);
  var child = this.createChild(taskName);
};

TaskRunner.prototype.stop = function(taskName){
  var debug = require('debug')('lib/TaskRunner.js:stop()');
  var that = this;

  if(typeof taskName === 'undefined'){
    var allTaskNames = Object.keys(that.threads);
    for(var i=0; i<allTaskNames.length; i++){
      var _taskName = allTaskNames[i];
      debug("Stopping the task");  
      that.threads[_taskName].send('stop');
      debug('Removing task '+_taskName+" from array");
      delete that.threads[_taskName];
    }
  }else if(that.threads[taskName]){
    debug("Stopping the task");  
    that.threads[taskName].stop();
    debug('Removing task '+taskName+" from array.");
    delete that.threads[taskName];
  }
};

TaskRunner.prototype.destroy = function(){
  process.kill();
};

})();
