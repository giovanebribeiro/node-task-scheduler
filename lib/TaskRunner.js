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

TaskRunner.prototype.generateDelay = function(taskName){
  var debug = require('debug')('lib/TaskRunner.js:calculateDelay()');

  debug('Get the taskData related to taskName');
  var taskElement = this.manager.tasksSaved[taskName];
  
  var startDate = new Date();
 
  if(taskElement.endDate){
    if(startDate > taskElement.endDate){
      debug('startDate is bigger than task endDate. Returning undefined.');
      // if the startDate is bigger than task end date, the delay is undefined
      // the task must be removed from task manager.
      return undefined;
    }
  }
  
  debug("Calculating the delay");
  var scheduler = cronParser.parseExpression(taskElement.cron);
  var nextOcurrence = scheduler.next();
  var delay = nextOcurrence.getTime() - startDate.getTime();

  return delay;
};

TaskRunner.prototype.createChild = function(taskName){
  var debug = require('debug')('lib/TaskRunner.js:createChild()');
  var that = this;

  debug("Generating the delay");
  var delay = this.generateDelay(taskName);
  if(delay){
    debug("Creating the child");
    var child = new (forever.Monitor)(path.join(__dirname, path.sep, 'Task.js'), {
      max: 1,
      silent: true,
       args: [delay, taskName]
    });
    child.on('stdout', function(m){
      that.emit('stdout', m.toString('utf-8')); 
    });
    child.on('exit', function(){
      // when the task is over, calculate the next delay and run again.
      delete that.threads[taskName];
      //var child2 = that.createChild(taskName);
      //that.threads[taskName] = child2;
    });

    debug("starting the child");
    child.start();
    return child;
  } 
};

TaskRunner.prototype.start = function(taskName){
  var debug = require('debug')('lib/TaskRunner:start');
  
  debug("Starting task", taskName);
  var child = this.createChild(taskName);
  this.threads[taskName] = child;

  /*
  var that = this;
  var tasksSaved = this.manager.tasksSaved;
  var taskNames = Object.keys(tasksSaved);
  debug(taskNames);

  // loading the tasks for the first time
  // The other executions will be made in
  // 'exit' event
  taskNames.forEach(function(taskName){
    debug("Starting task", taskName);
    var child = that.createChild(taskName);
    that.threads[taskName] = child;
  });

  */
};

TaskRunner.prototype.stop = function(taskName){
  var debug = require('debug')('lib/TaskRunner.js:stop()');
  var that = this;

  if(typeof taskName === 'undefined'){
    var allTaskNames = Object.keys(that.threads);
    allTaskNames.forEach(function(_taskName){
      that.threads[_taskName].stop();
      debug('Removing task '+taskName+" from array");
      delete that.threads[_taskName];
    });
  }else if(that.threads[taskName]){
    that.threads[_taskName].stop();
    debug('Removing task '+taskName+" from array.");
    delete that.threads[taskName];
  }
};

TaskRunner.prototype.destroy = function(){
  process.kill();
};

})();
