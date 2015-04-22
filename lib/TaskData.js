(function(){
'use strict';

/*
 * File: lib/TaskData.js
 * Author: Giovane Boaviagem
 *
 * Represents the task data.
 */
var cronParser = require('cron-parser');
var later = require('later');
var f=require('./util/file.js');
var path = require('path');
var debug = require('debug')('TaskData');
require('./util/string.js');
var async = require('async');

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
module.exports = TaskData = function(name, activity, freq, endDate){
  // populating the attributes
  this.name = name || "";
  this.cron = freq || "";
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

  var dataFile = require(pathDataFile);
  var _tempDate = new Date(Number(dataFile.endDate));
  
  var activityFile = require(pathActivityFile);
 
  debug("populating the final object");
  var taskData = new TaskData();
  taskData.name = dataFile.name;
  taskData.endDate = _tempDate;
  taskData.cron = dataFile.cron;
  taskData.activity = activityFile;

  return taskData;

};

/**************
 *** PUBLIC ***
 **************/

/*
 * Returns the task filename.
 */
TaskData.prototype.getTaskDataFile = function(){
  return path.join(TaskData.getTasksDir(),this.name+".json");
};

TaskData.prototype.getTaskActivityFile = function(){
  return path.join(TaskData.getTasksDir(),this.name+".js");
};

/*
 * Export the object to a file.
 */
TaskData.prototype.toFile = function(cb){
  // parsing the objects to string
  var endDateString = "";
  if(this.endDate !== null){
   endDateString = this.endDate.toString();
  }
  var cronString = this.cron;

  var activityString = this.activity.toString();

  var dataFile = this.getTaskDataFile();
  var activityFile = this.getTaskActivityFile();

  var obj = {
    name: this.name,
    cron: cronString,
    endDate: endDateString
  };

  // creating the files
  async.parallel([
      // writing the data file
      function(callback){
        f.write(dataFile, JSON.stringify(obj), function(err){
          if(err) return callback(err);
  
          debug("Data File successfully created.");
          return callback();
        });
      },

      // writing the activity file
      function(callback){
        var file = "module.exports = "+activityString+";";
        f.write(activityFile, file, function(err){
          if(err) return callback(err);

          debug("Activity File successfully created.");
          return callback(err);
        });
      }
  ], function(err){
    if(err) return cb(err);

    return cb();
  });

 };

/*
 * Set the cron string
 */
TaskData.prototype.setCron = function(freq){
  if(!freq || freq === ""){
    throw new Error("Task frequency is incorrect.");
  }

  this.cron= freq;
};

/*
 * Destroy the task files.
 */
TaskData.prototype.destroyFiles = function(){
  if(f.exists(this.getTaskDataFile())){
    f.rm(this.getTaskDataFile());
  }

  if(f.exists(this.getTaskActivityFile())){
    f.rm(this.getTaskActivityFile());
  }
};

})();
