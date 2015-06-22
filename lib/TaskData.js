/**
 * @file lib/TaskData.js - Represents a task data
 * @author Giovane Boaviagem
 * @version 1.0.0
 */
(function(){
'use strict';

var f=require('./util/file.js');
var path = require('path');
require('./util/string.js');
var async = require('async');
var debug = require('debug')('node-task-scheduler:lib/TaskData');

var TaskData;

/**
 * @contructor
 * @this {TaskData}
 *
 * @param {string} name - Task name. Must be unique, and will be the task json file name
 * @param {function} activity - Function to be executed. The function MUST have a callback with no params
 * @param {string} freq - Cron-string with the frequency of the task executions. Check this link (https://github.com/harrisiirak/cron-parser) for details.
 * @param {Date} endDate - Limit date to execute the task.
 * @param {JSON} args - Task input data.
 *
 * @example
 * // starts a new TaskData object
 * var TaskData = require('/path/to/TaskData.js');
 * var taskData = new TaskData("task1", function(callback){ console.log("Hello!!"); callback();}, '* * * * *', new Date());
 */
module.exports = TaskData = function(name, activity, freq, endDate, args){
  // populating the attributes
  this.name = name || "";
  this.cron = freq || "";
  this.activity = activity || undefined;
  this.endDate = endDate || null;
  this.args = args || {};
};

/**
 * Converts task file to TaskData object.
 *
 * @this {TaskData}
 * @static
 * @param {string} taskName - The name of the task
 * @param {function} cb - Callback function with the taskData object.
 * @example
 * //
 * TaskData.toTaskData('hello', function(taskData){
 *    // do some code...
 * });
 */
TaskData.toTaskData = function(tasksDir, taskName, cb){
  var pathFile = path.join(tasksDir, taskName);
  var pathDataFile = pathFile + ".json";
  var pathActivityFile = pathFile + ".js";

  if(!f.exists(pathDataFile)){
    throw new Error("Task data file not exists.");
  }

  if(!f.exists(pathActivityFile)){
    throw new Error("Task activity file not exists.");
  }

  debug('toTaskData() - Loading the data file');
  var dataFile = require(pathDataFile);
  debug('toTaskData() - Loading the activity file');
  var activityFile = require(pathActivityFile);
  
  var _tempDate = new Date(Number(dataFile.endDate));
 
  debug("toTaskData() - populating the final object");
  var taskData = new TaskData();
  taskData.name = dataFile.name;
  taskData.endDate = _tempDate;
  taskData.cron = dataFile.cron;
  taskData.activity = activityFile;
  taskData.args = dataFile.args;

  debug('toTaskData() - Task Data imported sucessfully.');
  return cb(taskData);
};

/**
 * @public
 * @this {TaskData}
 * @return {string} The complete path of task data file
 */
TaskData.prototype.getTaskDataFile = function(tasksDir){
  return path.join(tasksDir,this.name+".json");
};

/**
 * @public
 * @this {TaskData}
 * @return {string} The complete path of task data file
 */
TaskData.prototype.getTaskActivityFile = function(tasksDir){
  return path.join(tasksDir,this.name+".js");
};

/**
 * Export the object to a file.
 *
 * @public
 * @this {TaskData}
 * @param {function} cb - Callback function with the error object param
 * @example
 * // 
 * taskData.toFile(function(err){
 *    if(err) throw err;
 *
 *    // do some code
 * });
 */
TaskData.prototype.toFile = function(tasksDir, cb){
  debug('toFile() - parsing the objects to string');
  var endDateString = "";
  if(this.endDate !== null){
   endDateString = this.endDate.toString();
  }
  var cronString = this.cron;

  var activityString = this.activity.toString();

  var dataFile = this.getTaskDataFile(tasksDir);
  var activityFile = this.getTaskActivityFile(tasksDir);

  debug('toFile() - creating the object');
  var obj = {
    name: this.name,
    cron: cronString,
    endDate: endDateString,
    args: this.args,
  };

  // creating the files
  async.parallel([
      function(callback){
        debug('toFile() - Writing the data file');
        f.write(dataFile, JSON.stringify(obj), function(err){
          if(err) return callback(err);
  
          debug("toFile() - Data File successfully created.");
          return callback();
        });
      },

      // writing the activity file
      function(callback){
        debug('toFile() - Writing the activity file');
        var file = "module.exports = "+activityString+";";
        f.write(activityFile, file, function(err){
          if(err) return callback(err);

          debug("toFile() - Activity File successfully created.");
          return callback(err);
        });
      }
  ], function(err){
    debug('toFile() - Task data successfully exported.');
    return cb(err);
  });

 };

/**
 * Set the cron string
 *
 * @public
 * @this {TaskData}
 * @param {string} freq - The cron-like frequency
 */
TaskData.prototype.setCron = function(freq){
  if(!freq || freq === ""){
    throw new Error("Task frequency is incorrect.");
  }

  this.cron= freq;
};

/**
 * Destroy the task files.
 *
 * @public
 * @this {TaskData}
 */
TaskData.prototype.destroyFiles = function(tasksDir){
  if(f.exists(this.getTaskDataFile(tasksDir))){
    f.rm(this.getTaskDataFile(tasksDir));
  }

  if(f.exists(this.getTaskActivityFile(tasksDir))){
    f.rm(this.getTaskActivityFile(tasksDir));
  }
};

})();
