/**
 * @file lib/TaskScheduler.js - Class to manage all framework
 * @author Giovane Boaviagem
 * @version 1.0.0
 */
var TaskManager = require('./TaskManager.js');
var TaskRunner = require('./TaskRunner.js');
var events = require('events');
var utile = require('utile');
var debug = require('debug')('node-task-scheduler:lib/TaskScheduler');
var f = require('./util/file.js');
/**
 * @contructor 
 * @this {TaskScheduler}
 */
var TaskScheduler = function(tasksDir){
  var self = this;

  this.manager = new TaskManager(tasksDir);
  this.runner = new TaskRunner(this.manager);

  // adding listeners
  this.runner.on('runner', function(type, pid, data){
    self.emit("scheduler", type, pid, data);

    // if the task is over, remove it from TaskManager array.
    if(type === "task_exit"){
      self.manager.remove(data.task);  
    }
  });
};

utile.inherits(TaskScheduler, events.EventEmitter);

/**
 * Start tasks previously saved
 * 
 * @public
 * @param {function} callback function with 2 params: err object and the array of task names.
 * @this {TaskScheduler}
 *
 * @example
 * //
 * taskScheduler.start(function(){
 *    // do some code...
 * });
 */
TaskScheduler.prototype.start = function(cb){
  var self = this;

  if(this.runner.isEmpty()){
    var tasksDir = this.manager.tasksDir;
    debug('start() - tasks dir: '+tasksDir);
    if(!f.exists(tasksDir)){
      f.mkdir(tasksDir);
    }

    debug('start() - Load stored tasks');
    this.manager.loadTasks(function(err, tasksSaved){
      if(err) return cb(err);

      debug("start() - Start the tasks");
      var taskNames = Object.keys(tasksSaved);
      for(var i=0; i<taskNames.length; i++){
        var taskName = taskNames[i];
        debug("start() - starting task "+taskName);
        self.runner.startTask(taskName);
      }

      cb(null, taskNames);
    });
  }
};

/**
 * @public
 * @this {taskName}
 * @param {string} taskName - the name of the task
 * @return {boolean} if task is present in scheduler, or not.
 */
TaskScheduler.prototype.haveTask = function(taskName){
  return this.manager.haveTask(taskName);
};

/**
 * @public
 * @this {TaskScheduler}
 * @param {string} taskName The task name
 * @return {boolean} if task is running
 */
TaskScheduler.prototype.isRunning = function(taskName){
  return this.runner.isRunning(taskName);
};

/**
 * Remove a task from scheduler
 *
 * @public
 * @this {TaskScheduler}
 * @param {string} taskName - the name of the task
 */
TaskScheduler.prototype.removeTask = function(taskName, cb){
  // stopping the task, and remove it
  if(this.runner.isRunning(taskName)){
    this.runner.stop(taskName, function(){
      debug("Task successfully removed.");

      cb();
    });
  } 
};

/**
 * Adds a task to scheduler. 
 *
 * @public
 * @this {TaskScheduler}
 * @param {string} name - Task name. If the name is already assigned to other task, this task will be updated with these data.
 * @param {json} args - A JSON with the task input data. The the task have no arguments, put an empty JSON.
 * @param {function} activity - Function to be executed. MUST have 2 params: the json args, and a callback, which can have 2 parameters when called: the err object and the exit code. (see the lib/TaskConstraints.js file to check the reserved codes).
 * @param {string} cronFreq - Cron-string with the frequency of the task executions. Check this link (https://github.com/harrisiirak/cron-parser) for details.
 * @param {Date} endDate - (optional) Limit date to execute the task.
 *
 * @example
 * //
 * taskScheduler.addTask('hello', function(callback){ console.log('Hello!!'); callback(); }, '* * * * *', new Date());
 */
TaskScheduler.prototype.addTask = function(name, args, activity, cronFreq, endDate){
 var self = this;

 this.manager.createTask(name, args, activity, cronFreq, endDate, function(err, taskData){
  if(err) throw err;

  // after create, start the task.
  if(!self.runner.isRunning(name)){
    self.runner.startTask(name);
  }
 });
};

/**
 * Returns an array with all task names
 *
 * @public
 * @this {TaskManager}
 */
TaskScheduler.prototype.listTasks = function(){
  return  this.manager.listTasks();
};

/**
 * Returns the amount of tasks registered in system
 *
 * @public
 * @this {TaskManager}
 */
TaskScheduler.prototype.count = function(){
  return this.manager.count();
};

/**
 * Removes all tasks
 *
 * @public
 * @this {TaskManager}
 */
TaskScheduler.prototype.clean = function(){
  return this.manager.clean();
};


module.exports = TaskScheduler;

