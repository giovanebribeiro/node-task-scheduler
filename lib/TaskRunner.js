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

TaskRunner.prototype.start = function(){
  var that = this;
  var debug = require('debug')('lib/TaskRunner:start');

  debug("Starting the main loop (recursive loop)");

  this.loop();
};

TaskRunner.prototype.loop = function(){
  var debug = require('debug')('lib/TaskRunner.js:loop()');

  function onExit(){
    console.log("The task ended.");
  }

  var child,
      that = this;
  /*    onMessage = function(message){
        that.emit('event', 'task message', this.pid, message);
      },
      onError = function(err){
        that.emit('event', 'task error', this.pid, err);
      },
      onDisconnect = function(err){
        that.emit('event', 'task disconnect', this.pid, 'killing...');
        this.kill();
      };*/

  debug("tasksSaved", Object.keys(this.manager.tasksSaved));
  debug("threads", Object.keys(this.threads));
  var tasksSaved = this.manager.tasksSaved;

  // loading the queue
  for(var taskName in tasksSaved){
    debug("Task name = "+taskName);
    if(!this.threads.hasOwnProperty(taskName)){
      var taskElement = tasksSaved[taskName];
      debug("taskElement = "+taskElement);
      
      // - Set the flag to true and saveIt,
      // - calculate the next time in future, subtract from now;
      // - setTimeout with this time, executing the activity and set the flag 
      // queued to false.
      debug("Calculating the delay");

      var startDate = new Date();

      var scheduler = cronParser.parseExpression(taskElement.cron);
      var nextOcurrence = scheduler.next();
      debug(nextOcurrence);
      var delay = nextOcurrence.getTime() - startDate.getTime();
      debug("delay = ", delay);

      debug('forking the task');
      var _args = [delay, taskName];
      child = new (forever.Monitor)(path.join(__dirname, path.sep, 'Task.js'), {
        max: 1,
        silent: true,
        args: _args
      });
      child.on('exit', onExit);
      /*var args = [delay, taskName];
      child = cp.fork(path.join(__dirname, path.sep, 'Task.js'), args);
      child.on('message', onMessage);
      child.on('error', onError);
      child.on('disconnect', onDisconnect);*/
      that.threads[taskName] = child; 
    }
  
  } // for end

    
  // call the function again
  // give node some time to clear the stack and prevent errors
  setTimeout(function(){
    that.loop();
  }, 0);
};

TaskRunner.prototype.stop = function(taskName){
  var debug = require('debug')('lib/TaskRunner.js:stop()');
  var that = this;

  if(typeof taskName === 'undefined'){
    var allTaskNames = Object.keys(that.threads);
    allTaskNames.forEach(function(_taskName){
      debug('Removing task '+_taskName);
      that.threads[_taskName].disconnect();
      debug('Removing task '+taskName+" from array");
      delete that.threads[_taskName];
    });
  }else if(that.threads[taskName]){
    debug('Removing task '+taskName);
    that.threads[taskName].disconnect();
    debug('Removing task '+taskName+" from array.");
    delete that.threads[taskName];
  }
};

TaskRunner.prototype.destroy = function(){
  process.kill();
};

})();
