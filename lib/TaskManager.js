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
  this.tasksData = {};
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
  if(arguments.length < 3){
    throw new Error('Invalid arguments');
  }else{
   
    if(typeof name != "string"){
      throw new Error("The task name must be a string");
    }

    if(typeof freq != "string"){
      throw new Error("The task frequency must be a string");
    }

    if(typeof activity != "function"){
      throw new Error("The task activity must be a function");
    }

    if(endDate && !(endDate instanceof Date)){
      throw new Error("The final task date must be a Date object");
    }
  
  }

  // Creating the TaskData object
  var taskData;

  //if taskData exists, load the existent Task
  if(this.tasksData[name]){
    taskData = this.tasksData[name];
    // updated it.
    taskData.setCron(freq);
    taskData.activity = activity;
    if(endDate){
      taskData.endDate = endDate; 
    }
  }else{
    if(endDate){
      taskData = new TaskData(name, freq, activity, endDate);
    }else{
      taskData = new TaskData(name, freq, activity);
    }
  }

  // save the task in file...
  taskData.toFile();
  // ... save the taskData in tasksData array
  this.tasksData[name] = taskData;
  
  // start the task
  // ### implementar depois!!
};


})();
