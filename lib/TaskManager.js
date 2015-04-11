(function(){
'use strict';

/*
 * File: management.js
 * Author: Giovane Boaviagem
 * 
 * Functions to manage tasks (create, update and remove)
 */
var debug = require('debug')('TaskManager');
var TaskData = require('./TaskData');

var TaskManager;

// Constructor
module.exports = TaskManager = function(){
  this.tasksSaved = {};
};

/*
 * Create (or update) a task, saving the data in a json-file, stored in lib/tasks folder.
 *
 * Parameters:
 * - name: Task name. Must be unique, and will be the task json file name
 * - freq: Cron-string with the frequency of the task executions. Check this link (https://github.com/harrisiirak/cron-parser) for details.
 * - activity: Function to be executed.
 * - endDate (optional): Limit date to execute the task.
 */
TaskManager.prototype.createOrUpdate = function(name, freq, activity, endDate){
  // 
  // checking parameters
  //
  // < 3, error!
  if(!arguments.length){
    throw new Error("The task name is required, at least");
  }
    
  if(typeof name != "string"){
    throw new Error("The task name must be a string");
  }

  if(freq && (typeof freq != "string")){
    throw new Error("The task frequency must be a string");
  }

  if(activity && (typeof activity != "function")){
    throw new Error("The task activity must be a function");
  }

  if(endDate && !(endDate instanceof Date)){
    throw new Error("The final task date must be a Date object");
  }
  
  

  // Creating the TaskData object
  var taskData;

  //if taskData exists, load the existent Task
  if(this.tasksSaved[name]){
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

  }else{
    if(arguments.length < 3){
      throw new Error("Insufficient parameters");
    }

    if(endDate){
      taskData = new TaskData(name, freq, activity, endDate);
    }else{
      taskData = new TaskData(name, freq, activity);
    }
  }

  // save the task in file...
  taskData.toFile();
  // ... save the taskData in tasksSaved array
  this.tasksSaved[name] = taskData;
  
  // start the task
  // ### implementar depois!!
};

TaskManager.prototype.remove = function(name){
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
