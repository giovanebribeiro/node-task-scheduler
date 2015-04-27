(function(){
'use strict';

/*
 * File: management.js
 * Author: Giovane Boaviagem
 * 
 * Functions to manage tasks (create, update and remove)
 */
var TaskData = require('./TaskData');
var util = require('util');
var events = require('events');
var f = require('./util/file.js');
require('./util/string.js');
var cp = require('child_process');
var async = require('async');

var TaskManager;

/*
 * Constructor
 */
module.exports = TaskManager = function(){
  this.tasksSaved = {};
};
/*
 * Make TaskManager a subclass of EventEmitter
 */
util.inherits(TaskManager, events.EventEmitter);

/*
 * Create a new task
 * name {string} (Required) The task name
 * activity {function} (Required) What the task will do?
 * cronFreq {string} (Optional) cron-like string frequency (Default value: '* * * * *'). Check this link (https://github.com/harrisiirak/cron-parser) for details
 * endDate {Date} (Optional) Last date to execute
 */
TaskManager.prototype.createTask = function(name, activity, cronFreq, endDate,cb){
  var debug = require('debug')('lib/TaskManager:createTask');
  // managing the required arguments
  if(!arguments.length){
    throw new Error("The task name, and the activity are required");
  } 
  if(typeof name != "string"){
    throw new Error("The task name must be a string");
  }
  if(typeof activity != "function"){
    throw new Error("The task activity must be a function");
  }
  // managing the default values for optional arguments
  switch(arguments.length-2){ // we have 2 required arguments.
    case 0: 
      cronFreq = "* * * * *"; 
      // this way, you tell to JSHint your 
      // intention to ignore the 'break' word in case block
      /* falls through */
    case 1:
      if(typeof endDate == "function"){
        cb = endDate;
      }
      /* falls through */
    default:
      // does nothing
  }

  /*
  // If the task already exists, update it!
  if(this.tasksSaved[name]){
    debug("Task exists. call 'updateTask' function");
    return this.updateTask(name, activity, cronFreq, endDate);
  }*/

  // creating the task object
  var taskData = new TaskData(name, activity, cronFreq, endDate);
  this.tasksSaved[name] = taskData;

  taskData.toFile(function(err){
    cb(err, taskData);
  });
};

/*
 * Removes the task
 */
TaskManager.prototype.remove = function(name){
  var debug = require('debug')('lib/TaskManager:remove');
  if(!name){
    throw new Error("The task name is required");
  }

  if(typeof name != "string"){
    throw new Error("The task name must be a string");
  }

  this.tasksSaved[name].destroyFiles(); //remove the backup files.
  delete this.tasksSaved[name];
};

/*
 * Load the tasks previously saved in file
 */
TaskManager.prototype.loadTasks = function(cb){
  var debug = require('debug')('lib/TaskManager:loadTasks');

  var tasksDir = TaskData.getTasksDir();
  var that = this;

  if(!f.exists(tasksDir)){
    throw new Error("Tasks folder not found.");
  }

  f.readDir(tasksDir, function(err, files){
    if(err) return cb(err);

    function loop(count){
      if(count < files.length){
        debug("file: ",files[count]);
        if(files[count].endsWith('.json')){
          var taskName = files[count].removeExt();
          TaskData.toTaskData(taskName, function(taskData){
            that.tasksSaved[taskName] = taskData;
            count++;
            loop(count);
          });
        }else{
          count++;
          loop(count);
        }
      }
    }

    loop(0);
    cb(err, that.tasksSaved);
  });
};

/*
 * Removes all tasks
 */
TaskManager.prototype.clean = function(){
  for(var taskName in this.tasksSaved){
    var taskData = this.tasksSaved[taskName];
    taskData.destroyFiles(); 
  }

  this.tasksSaved = {};
};

})();
