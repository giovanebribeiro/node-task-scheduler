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

  // listener the events of the children (Task Runner)
  that.on('event', function(type, pid, message){
   if(type === "task message"){
    // this moment, the task is over, and must be deleted from threads
    delete this.threads[message.taskName]; 
   } 
  });

  this.loop();
};

TaskRunner.prototype.loop = function(){
  var debug = require('debug')('lib/TaskRunner.js:loop()');
  var later = require('later');

  var child,
      that = this,
      onMessage = function(message){
        that.emit('event', 'task message', this.pid, message);
      },
      onError = function(err){
        that.emit('event', 'task error', this.pid, err);
      },
      onDisconnect = function(err){
        that.emit('event', 'task disconnect', this.pid, 'killing...');
        this.kill();
      };

  debug(Object.keys(this.manager.tasksSaved));
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

      /*
      // set the flag queued to true and save it.
      taskElement.queued = true;
      this.queue[taskName] = taskElement;
      */

      // calculate the next time in future
      /*debug("taskElement", taskElement.cron);
      var cronString = taskElement.cron;
      var cronParser = later.parse.cron(cronString, true); // including seconds
      debug("cronParser: ",cronParser);
      var scheduler = later.schedule(cronParser);
      debug(scheduler);
      var nextOccurrence = scheduler.next(1, startDate);*/
      var scheduler = cronParser.parseExpression(taskElement.cron);
      var nextOcurrence = scheduler.next();
      debug(nextOcurrence);
      var delay = nextOcurrence.getTime() - startDate.getTime();

      debug('forking the task');
      var args = [delay, taskName];
      child = cp.fork(path.join(__dirname, path.sep, 'Task.js'), args);
      child.on('message', onMessage);
      child.on('error', onError);
      child.on('disconnect', onDisconnect);
      that.threads[taskName] = child;  
    }
  
  }

  // call the function again
  // give node some time to clear the stack and prevent errors
  setTimeout(function(){
    that.loop();
  }, 0);
};

})();
