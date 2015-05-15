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

var manager = new TaskManager();
var runner = new TaskRunner(manager);

/**
 * @contructor 
 * @this {TaskScheduler}
 */
var TaskScheduler = function(){
  var self = this;

  // adding listeners
  runner.on('runner', function(type, pid, data){
    self.emit("scheduler", type, pid, data);

    // if the task is over, remove it from TaskManager array.
    if(type === "task_exit"){
      manager.remove(data.task);  
    }
  });
};

utile.inherits(TaskScheduler, events.EventEmitter);

/**
 * Start tasks previously saved
 * 
 * @public
 * @param {function} callback function with no params
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

  if(runner.isEmpty()){
    debug('start() - Load stored tasks');
    manager.loadTasks(function(err, tasksSaved){
      if(err) throw err;

      debug("start() - Start the tasks");
      var taskNames = Object.keys(tasksSaved);
      for(var i=0; i<taskNames.length; i++){
        var taskName = taskNames[i];
        debug("start() - starting task "+taskName);
        runner.startTask(taskName);
      }

      cb();
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
  return manager.haveTask(taskName);
};

/**
 * @public
 * @this {TaskScheduler}
 * @param {string} taskName The task name
 * @return {boolean} if task is running
 */
TaskScheduler.prototype.isRunning = function(taskName){
  return runner.isRunning(taskName);
};

/**
 * Remove a task from scheduler
 *
 * @public
 * @this {TaskScheduler}
 * @param {string} taskName - the name of the task
 */
TaskScheduler.prototype.removeTask = function(taskName){
  // stopping the task, and remove it
  if(runner.isRunning(taskName)){
    runner.stop(taskName);
  } 
};

/**
 * Adds a task to scheduler. 
 *
 * @public
 * @this {TaskScheduler}
 * @param {string} name - Task name. If the name is already assigned to other task, this task will be updated with these data.
 * @param {function} activity - Function to be executed. The function MUST have a callback with no params
 * @param {string} cronFreq - Cron-string with the frequency of the task executions. Check this link (https://github.com/harrisiirak/cron-parser) for details.
 * @param {Date} endDate - (optional) Limit date to execute the task.
 *
 * @example
 * //
 * taskScheduler.addTask('hello', function(callback){ console.log('Hello!!'); callback(); }, '* * * * *', new Date());
 */
TaskScheduler.prototype.addTask = function(name, activity, cronFreq, endDate){
 var self = this;

 manager.createTask(name, activity, cronFreq, endDate, function(err, taskData){
  if(err) throw err;

  // after create, start the task.
  if(!runner.isRunning(name)){
    runner.startTask(name);
  }
 });
};

module.exports = TaskScheduler;

