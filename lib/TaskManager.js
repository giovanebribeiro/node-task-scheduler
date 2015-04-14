(function(){
'use strict';

/*
 * File: management.js
 * Author: Giovane Boaviagem
 * 
 * Functions to manage tasks (create, update and remove)
 */
var debug = require('debug')('lib/TaskManager');
var TaskData = require('./TaskData');
var util = require('util');
var events = require('events');
var f = require('./util/file.js');
require('./util/string.js');
var cp = require('child_process');

var TaskManager;

/*
 * Constructor
 */
module.exports = TaskManager = function(){
  this.tasksSaved = {};
  this.threads = {};

  // loading the tasksSaved list.
  var tasksDir = TaskData.getTasksDir();
  if(f.exists(tasksDir)){
    var files = f.readDir(tasksDir);
    for(var i=0; i<files.length; i++){
      var file = files[i];
      if(file.endsWith(".json")){
        var taskData = TaskData.toTaskData(file.removeExt());
        this.tasksSaved[taskData.name] = taskData; 
      }
    }
  }else{
    debug("Empty task list. Nothing to do.");
  }
};
/*
 * Make TaskManager a subclass of EventEmitter
 */
util.inherits(TaskManager, events.EventEmitter);
/*
 * Starts the task
 */
TaskManager.prototype.startTask = function(taskData){
   // loading variables
   var that = this;
   var i,
   child,
   task,
   onMessage = function(message){
     // this.pid se refers to CHILD the 'this'
     that.emit('event', 'child message', this.pid, message);
    },
   onError = function(err){
     that.emit('event', 'child error', this.pid, err);
   },
   onDisconnect = function(err){
     that.emit('event', 'child disconnect', this.pid, 'killing...');
     this.kill();
     delete that.threads[this.pid]; // remove from threads array
   };

   // Running task
   var args = [taskData];
   child = cp.fork(__dirname+'/TaskRunner.js', args);
   child.on('message', onMessage);
   child.on('error', onError);
   child.on('disconnect', onDisconnect);
   that.threads[child.pid] = child;

};
/*
 * Starts the pool of threads
 */
TaskManager.prototype.start = function(){
  // save the TaskManager object to avoid conflicts with child object. 
  var that = this;
  
  if(this.tasksSaved == {}){
    debug("Empty task list. Nothing to do.");
    return;
  }

  for(var taskname in this.tasksSaved){
    var taskData = this.tasksSaved[taskname];

    this.startTask(taskData);
  }
};
/*
 * Stop the thread specified. If pid is undefined,
 * all threads will stop.
 */
TaskManager.prototype.stop = function(pid){
  var that = this;

  if(typeof pid === "undefined"){
    var allPids = Object.keys(this.threads);
    allPids.forEach(function(key, i, arr){
      that.threads[key].disconnect();
    });
  }else if( threads[pid] ){
    that.threads[pid].disconnect();    
  }
};
/*
 * Destroy the process
 */
TaskManager.prototype.destroy = function(){
  process.kill();
};
/*
 * Create (or update) a task, saving the data in a json-file, stored in lib/tasks folder.
 *
 * Parameters:
 * - name: Task name. Must be unique, and will be the task json file name
 * - freq: Cron-string with the frequency of the task executions. Check this link (https://github.com/harrisiirak/cron-parser) for details.
 * - activity: Function to be executed.
 * - endDate (optional): Limit date to execute the task.
 * - startArterCreate (optional): Boolean. Start task after create? Default: true
 */
TaskManager.prototype.createOrUpdate = function(name, freq, activity, op1, op2){
  // 
  // checking parameters
  //
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

  // treating the optional params
  var startAfterCreate;
  startAfterCreate = (typeof op1 == "boolean")? op1 : true;
  startAfterCreate = (typeof op2 == "boolean")? op2 : true;

  var endDate;
  endDate = (op1 instanceof Date)? op1 : undefined;
  endDate = (op2 instanceof Date)? op2 : undefined;

  // Creating the TaskData object
  var taskData;

  //if taskData exists, load the existent Task
  var isUpdate = false;
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

    isUpdate = true;
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

  debug("save the task in file...");
  taskData.toFile();
  // ... save the taskData in tasksSaved array
  this.tasksSaved[name] = taskData;
  
  if(!isUpdate && startAfterCreate){
    debug("start the task");
    this.startTask(taskData);
  }
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
