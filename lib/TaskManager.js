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
 * Starts a task
 * name {string} task name
 */
TaskManager.prototype.startTask = function(name){
  debug("Task ",name, "started.");
};
/*
 * Starts the pool of threads
 */
TaskManager.prototype.start = function(cb){
  var tasksDir = TaskData.getTasksDir();
  
  if(!f.exists(tasksDir)){
    throw new Error("Tasks folder not found");
  }

  var taskFiles = [];
  var that = this;

  f.readDir(tasksDir, function(err, files){
    if(err) return cb(err);

    for(var i=0;i<files.length;i++){
      debug("file: ",files[i]);
      if(files[i].endsWith('.json')){
        var taskName = files[i].removeExt();
        var taskData = TaskData.toTaskData(taskName);

        debug("starting the task");
        runTask(this, taskData);

        debug("saving the task data in array");
        that.tasksSaved[taskData.name] = taskData;
      }
    }

    cb();
  });
};

/*
 * Runs a task
 * taskData {string} 
 */
var runTask = function(_this, taskData){
  var that = _this,
  child,
  onMessage = function(message){
    that.emit('event', 'child message', this.pid, message);
  },
  onError = function(err){
    that.emit('event', 'child error', this.pid, err);
  },
  onDisconnect = function(err){
    that.emit('event', 'child disconnect', this.pid, 'killing...');
    this.kill();
    that.tasksSaved[taskData.name].thread = undefined;
  };

  var args = [taskData.name];
  child = cp.fork(__dirname+'/TaskRunner.js', args);
  child.on('message', onMessage);
  child.on('error', onError);
  child.on('disconnect', onDisconnect);
  that.tasksSaved[taskData.name].thread = child;
};

/*
 * Starts the task
 
TaskManager.runTask = function(taskData){
   // loading variables
   var that = this,
   child,
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
   return child;
};
*/

/*
 * Starts the task and not add to pool.
 
TaskManager.prototype.startTask = function(taskData){
  var child = TaskManager.runTask(taskData);
  this.threads[child.pid] = child;
};
*/

/*
 * Starts the pool of threads
 
TaskManager.prototype.start = function(){
  // save the TaskManager object to avoid conflicts with child object. 
  var that = this;
  
  if(this.tasksSaved == {}){
    debug("Empty task list. Nothing to do.");
    return;
  }

  // loading the tasksSaved list.
  var tasksDir = TaskData.getTasksDir();
  if(f.exists(tasksDir)){
    var files = f.readDir(tasksDir);
    async.series([
       function(callback){
        
        var count = 0;
        files.forEach(function(file){

          if(file.endsWith(".json")){
            
            if(count == this.tasksSaved.length){
              return callback();
            }

            TaskData.toTaskData(file.removeExt(), function(err, taskData){
              if(err) return callback(err);

              this.tasksSaved[taskData.name] = taskData; 
              count++;
            });
          }

        });

      },

      function(callback){
        if(!f.exists(tasksDir) || this.tasksSaved.length === 0){
          debug("Empty task list. Nothing to do.");
        }

        callback();
      }
        
    ], function(err){
    
    });
  }

  for(var taskname in this.tasksSaved){
    var taskData = this.tasksSaved[taskname];

    this.startTask(taskData);
  }
};
*/
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
