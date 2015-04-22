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
 * startAfterCreate {Boolean} (Optional) Should I start the task after create? (Default value: true)
 * endDate {Date} (Optional) Last date to execute
 */
TaskManager.prototype.createTask = function(name, activity, cronFreq, endDate, startAfterCreate){
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
      startAfterCreate = true;
      /* falls through */
    default:
      // does nothing
  }

  // If the task already exists, update it!
  if(this.tasksSaved[name]){
    debug("Task exists. call 'updateTask' function");
    return this.updateTask(name, activity, cronFreq, endDate);
  }

  // creating the task object
  var taskData = new TaskData(name, activity, cronFreq, endDate);
  this.tasksSaved[name] = taskData;

  if(startAfterCreate){
    this.startTask(taskData.name);
  }
};

TaskManager.prototype.updateTask = function(name, activity, cronFreq, endDate){
  var debug = require('debug')('lib/TaskManager:updateTask');
  if(!arguments.length){
    throw new Error("The task name, and the activity are required");
  }
  
  if(typeof name != "string"){
    throw new Error("The task name must be a string");
  }

  if(activity && typeof activity != "function"){
    throw new Error("The task activity must be a function");
  }

  if(cronFreq && typeof cronFreq != "string"){
    throw new Error("The task frequency must be a string");
  }

  if(!this.tasksSaved[name]){
    debug("Task not exist. Call 'createTask' function");
    return this.createTask(name, activity, cronFreq, endDate);
  }
    

  taskData = this.tasksSaved[name];
    
  // updated it.
  if(freq){
    taskData.setCron(freq);
  }

  if(activity){
    taskData.activity = activity;
  }

  if(endDate){
    taskData.endDate = endDate; 
  }

  // ... save the taskData in tasksSaved array
  this.tasksSaved[name] = taskData;
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

    for(var i=0;i<files.length;i++){
      debug("file: ",files[i]);
      if(files[i].endsWith('.json')){
        var taskName = files[i].removeExt();
        var taskData = TaskData.toTaskData(taskName);
        that.tasksSaved[taskName] = taskData;

        /*var args = [taskData.name];
        child = cp.fork(__dirname+'/TaskRunner.js', args);
        child.on('message', onMessage);
        child.on('error', onError);
        child.on('disconnect', onDisconnect);
        taskData.thread = child;
        that.tasksSaved[taskName] = taskData;*/
      }
    }

    cb();
  });
};


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
})();
