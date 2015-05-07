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
  var debug = require('debug')('lib/TaskManager:createTask()');
  
  debug('managing the required arguments');
  if(!arguments.length){
    throw new Error("The task name, and the activity are required");
  } 
  if(typeof name != "string"){
    throw new Error("The task name must be a string");
  }
  if(typeof activity != "function"){
    throw new Error("The task activity must be a function");
  }
  if(typeof cronFreq != "string"){
    throw new Error("The task frequency must be string cron-like");
  }
  
  debug("typeof name:",typeof name);
  debug("typeof activity:",typeof activity);
  debug("typeof cronFreq:",typeof cronFreq);
  debug("typeof endDate:",typeof endDate);
  debug("typeof cb",typeof cb);
  
  debug('creating the task object');
  var taskData = new TaskData(name, activity, cronFreq, endDate);
  this.tasksSaved[name] = taskData;

  debug('exporting to file');
  taskData.toFile(function(err){
    debug('Task data exported. Calling callback');
    debug(typeof cb);
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
    f.mkdir(tasksDir)
  }

  f.readDir(tasksDir, function(err, files){
    if(err) return cb(err);
    debug(files);

    var jsonFiles = [];
    for(var i=0;i<files.length;i++){
      var file = files[i];
      if(file.endsWith(".json")){
        jsonFiles.push(file);
      }
    }

    function loop(count){
      debug('count = ', count);
      debug("jsonFiles.length", jsonFiles.length);
      if(count < jsonFiles.length){
        debug("file: ",jsonFiles[count]);
        var taskName = jsonFiles[count].removeExt();
        TaskData.toTaskData(taskName, function(taskData){
          that.tasksSaved[taskName] = taskData;
          count++;
          loop(count);
        });
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

TaskManager.prototype.haveTask = function(taskName){
  return this.tasksSaved.hasOwnProperty(taskName);
};

})();
