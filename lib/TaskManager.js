/**
 * @file lib/TaskManager.js - Class to manage TaskData objects
 * @author Giovane Boaviagem
 * @version 1.0.0
 */
(function(){
'use strict';

var TaskData = require('./TaskData');
var util = require('util');
var events = require('events');
var f = require('./util/file.js');
require('./util/string.js');
var cp = require('child_process');
var async = require('async');
var debug = require('debug')('node-task-scheduler:lib/TaskManager');

var TaskManager;

/**
 * @constructor
 * @this {TaskManager}
 */
module.exports = TaskManager = function(tasksDir){
  this.tasksSaved = {};
  this.tasksDir = tasksDir;
};
/*
 * Make TaskManager a subclass of EventEmitter
 */
util.inherits(TaskManager, events.EventEmitter);

/**
 * Creates a new task
 *
 * @public
 * @this {TaskManager}
 * @param {string} name - Task name. Must be unique, and will be the task json file name
 * @param {json} args - A JSON with the task input data. The the task have no arguments, put an empty JSON.
 * @param {function} activity - Function to be executed. MUST have a callback with 2 parameters: the err object and the exit code. (see the lib/TaskConstraints.js file to check the reserved codes).
 * @param {string} freq - Cron-string with the frequency of the task executions. Check this link (https://github.com/harrisiirak/cron-parser) for details.
 * @param {Date} endDate - (optional) Limit date to execute the task.
 * @param {function} cb - Callback function with 2 parameters: The error object and the TaskData object
 *
 * @example
 * // Creating a task
 * taskManager.createTask('hello', function(callback){ console.log("Hello!!"); callback(); }, '* * * * *', new Date(), function(err, taskData){
 *    // do some code...
 * });
 */
TaskManager.prototype.createTask = function(name, args, activity, cronFreq, endDate,cb){
  debug('createTask() - managing the required arguments');
  if(!arguments.length){
    throw new Error("The task name, the args and the activity are required");
  } 
  if(typeof name != "string"){
    throw new Error("The task name must be a string");
  }
  if(args.constructor != Object){
    throw new Error("The task args must be a object JSON");
  }
  if(typeof activity != "function"){
    throw new Error("The task activity must be a function");
  }
  if(typeof cronFreq != "string"){
    throw new Error("The task frequency must be string cron-like");
  }
  
  debug("createTask() - typeof name:",typeof name);
  debug("createTask() - typeof activity:",typeof activity);
  debug("createTask() - typeof cronFreq:",typeof cronFreq);
  debug("createTask() - typeof endDate:",typeof endDate);
  debug("createTask() - typeof cb",typeof cb);
  
  debug('createTask() - creating the task object');
  var taskData = new TaskData(name, activity, cronFreq, endDate, args);
  this.tasksSaved[name] = taskData;

  debug('createTask() - exporting to file');
  taskData.toFile(this.tasksDir, function(err){
    debug('createTask() - Task data exported. Calling callback');
    debug(typeof cb);
    cb(err, taskData);
  });
};

/**
 * Removes the task
 *
 * @public
 * @this {TaskManager}
 * @param {string} name - The task name to remove
 */
TaskManager.prototype.remove = function(name){
  if(!name){
    throw new Error("The task name is required");
  }

  if(typeof name != "string"){
    throw new Error("The task name must be a string");
  }

  if(this.tasksSaved[name]){
    this.tasksSaved[name].destroyFiles(this.tasksDir); //remove the backup files.
    delete this.tasksSaved[name];
  }
};

/**
 * Load the tasks previously saved in disk
 *
 * @public
 * @this {TaskManager}
 * @param {string} tasksDir - The tasks dir
 * @param {function} cb - Callback function with 2 params: the error object and an array of tasks saved.
 *
 * @example
 * //
 * taskManager.loadTasks(function(err, tasksSaved){
 *   // do some code..
 * });
 */
TaskManager.prototype.loadTasks = function(cb){
  var debug = require('debug')('lib/TaskManager:loadTasks() - ');

  var self = this;

  if(!f.exists(this.tasksDir)){
    f.mkdir(this.tasksDir);
  }

  f.readDir(this.tasksDir, function(err, files){
    if(err) return cb(err);
    debug('loadTasks() - Files found: '+files);

    var jsonFiles = [];
    for(var i=0;i<files.length;i++){
      var file = files[i];
      if(file.endsWith(".json")){
        jsonFiles.push(file);
      }
    }

    function loop(count){
      debug('loadTasks() - count = ', count);
      debug("loadTasks() - jsonFiles.length", jsonFiles.length);
      if(count < jsonFiles.length){
        debug("loadTasks() - file: ",jsonFiles[count]);
        var taskName = jsonFiles[count].removeExt();
        TaskData.toTaskData(self.tasksDir, taskName, function(taskData){
          self.tasksSaved[taskName] = taskData;
          count++;
          loop(count);
        });
      }
    }

    loop(0);
    cb(err, self.tasksSaved);
  });
};

/**
 * Removes all tasks
 *
 * @public
 * @this {TaskManager}
 */
TaskManager.prototype.clean = function(){
  for(var taskName in this.tasksSaved){
    var taskData = this.tasksSaved[taskName];
    taskData.destroyFiles(this.tasksDir); 
  }

  this.tasksSaved = {};
};

/**
 * Returns the amount of tasks registered in system
 *
 * @public
 * @this {TaskManager}
 */
TaskManager.prototype.count = function(){
  var size=0;
  var key;
  var that = this.tasksSaved;
  debug("that=", that);

  for(key in that){
    debug("key=", key);
    if(that.hasOwnProperty(key)) size++;
  }

  return size;
};

/**
 * Returns an array with all task names
 *
 * @public
 * @this {TaskManager}
 */
TaskManager.prototype.listTasks = function(){
  var that = this.tasksSaved;
  var arr = Object.keys(that);
  debug("arr=", arr);
  return arr;
};

/**
 * @public
 * @this {TaskManager}
 * @param {string} taskName - the name of the task
 * @return {boolean} if task is present in TaskManager object
 */
TaskManager.prototype.haveTask = function(taskName){
  return this.tasksSaved.hasOwnProperty(taskName);
};

})();
