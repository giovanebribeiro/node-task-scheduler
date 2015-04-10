(function(){
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
  this.cron = {};
  this.cron.string = freq || "";
  this.cron.iterator = (freq) ? cronParser.parseExpression(freq) : null;
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
  var pathDataFile = pathFile + ".json";
  var pathActivityFile = pathFile + ".js";

  if(!f.exists(pathDataFile)){
    throw new Error("Task data file not exists.");
  }

  if(!f.exists(pathActivityFile)){
    throw new Error("Task activity file not exists.");
  }
  
  // loading the files
  var dataFile = f.read(pathDataFile);
  var activityFile = require(pathActivityFile); // the activity file is a module


  // convert string to object.
  var tempObj = JSON.parse(dataFile);
  debug('tempObj = '+Number(tempObj.endDate));
  var _tempDate = new Date(Number(tempObj.endDate));
  debug('tempObj.endDate = '+_tempDate);

  // populating the final object
  var taskData = new TaskData();
  taskData.name = tempObj.name;
  taskData.endDate = _tempDate;
  taskData.cron.string = tempObj.cron;
  taskData.cron.iterator = cronParser.parseExpression(tempObj.cron);
  taskData.activity = activityFile;

  return taskData; 
};

/**************
 *** PUBLIC ***
 **************/

/*
 * Returns the task filename.
 */
TaskData.prototype.getTaskDatafile = function(){
  return path.join(TaskData.getTasksDir(),this.name+".json");
};

TaskData.prototype.getTaskActivityFile = function(){
  return path.join(TaskData.getTasksDir(),this.name+".js");
};

/*
 * Export the object to a file.
 */
TaskData.prototype.toFile = function(){
  // parsing the objects to string
  var endDateString = this.endDate.toString();
  var cronString = this.cron.string;

  // Creating the data file
  var obj = {
    name: this.name,
    cron: cronString,
    endDate: endDateString
  };

  f.write(this.getTaskDatafile(), JSON.stringify(obj));
  debug("Data File successfully created.");

  // creating the activity file
  var activityString = this.activity.toString();
  var file = "module.exports = "+activityString+";";
  f.write(this.getTaskActivityFile(), file);
  debug("Activity File successfully created.");
};
})();
