'use strict';
/*
 * File: lib/TaskData.js
 * Author: Giovane Boaviagem
 *
 * Represents the task data.
 */
var cronParser = require('cron-parser');
var f=require('./util/file.js');
var path = require('path');
var debug = require('debug')('TaskData');
require('./util/string.js');

var TaskData;

/*
 * Constructor.
 * 
 * Parameters:
 * - name: Task name. Must be unique, and will be the task json file name
 * - freq: Cron-string with the frequency of the task executions. Check this link (https://github.com/harrisiirak/cron-parser) for details.
 * - activity: Function to be executed.
 * - endDate (optional): Limit date to execute the task.
 */
module.exports = TaskData = function(name, freq, activity, endDate){
  // populating the attributes
  this.name = name || "";
  this.cron = cronParser.parseExpression(freq) || null;
  this.activity = activity || undefined;
  this.endDate = endDate || null;
};

/**************
 *** STATIC ***
 **************/

/*
 * Returns the 'tasks' directory path
 */
TaskData.getTasksDir = function(){
  var taskDir = path.join(__dirname, 'tasks');

  if(!f.exists(taskDir)){
    f.mkdir(taskDir);
  }

  return taskDir;
};

/*
 * Converts task file to TaskData object.
 *
 * Parameters:
 *  - taskName: Task name WITHOUT file extension.
 */
TaskData.toTaskData = function(taskName){
  var pathFile = path.join(TaskData.getTasksDir(),taskName);

  pathFile+=".json";

  if(!f.exists(pathFile)){
    throw new Error("Task file not exists.");
  }

  var taskFile = f.read(pathFile);

  // convert string to object.
  var tempObj = JSON.parse(taskFile);

  var taskData = new TaskData();
  taskData.name = tempObj.name;
  taskData.endDate = new Date(Number(tempObj.endDate));
  taskData.cron = JSON.parse(tempObj.cron);
  taskData.activity = new Function(tempObj.activity);

  return taskData; 
};

/**************
 *** PUBLIC ***
 **************/

/*
 * Returns the task filename.
 */
TaskData.prototype.getTaskFilename = function(){
  return path.join(TaskData.getTasksDir(),this.name+".json");
};

/*
 * Export the object to a file.
 */
TaskData.prototype.toFile = function(){
  // parsing the objects to string
  var activityString = this.activity.toString();
  var endDateString = this.endDate.toString();
  var cronString = JSON.stringify(this.cron);

  var obj = {
    name: this.name,
    cron: cronString,
    activity: activityString,
    endDate: endDateString
  };

  f.write(this.getTaskFilename(), JSON.stringify(obj));
  debug("File successfully created.");
};
