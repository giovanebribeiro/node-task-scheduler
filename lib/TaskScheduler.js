var TaskManager = require('./TaskManager.js');
var TaskRunner = require('./TaskRunner.js');
var events = require('events');
var utile = require('utile');

var runner = new TaskRunner();
var manager = new TaskManager();

/**
 *
 * Main class for Task Scheduler
 * @contructor 
 * @this {TaskScheduler}
 */
var TaskScheduler = function(){};

utile.inherits(TaskScheduler, events.EventEmitter);

/**
 * Start tasks previously saved
 * @param {function} callback function with no params
 * @this {TaskScheduler}
 */
TaskScheduler.prototype.start = function(cb){
  var self = this;
  var debug = require('debug')('TaskScheduler.start()');

  // adding listeners
  runner.on('runner', function(type, pid, data){
    self.emit("scheduler", type, pid, data);

    // if the task is over, remove it from TaskManager array.
    if(type === "task_exit"){
      manager.remove(data.task);  
    }
  });

  if(runner.isEmpty()){
    debug('Load stored tasks');
    manager.loadTasks(function(err, tasksSaved){
      if(err) throw err;

      debug("Start the tasks");
      var taskNames = Object.keys(tasksSaved);
      for(var i=0; i<taskNames.length; i++){
        var taskName = taskNames[i];
        debug("starting task "+taskName);
        runner.startTask(taskName);
      }

      cb();
    });
  }
};

TaskScheduler.prototype.haveTask = function(taskName){
  return manager.haveTask(taskName);
};

/**
 * Check if task is running
 * @this {TaskScheduler}
 * @param {string} taskName The task name
 */
TaskScheduler.prototype.isRunning = function(taskName){
  return runner.isRunning(taskName);
};


TaskScheduler.prototype.removeTask = function(taskName, callback){
  // stopping the task, and remove it
  if(runner.isRunning(taskName)){
    runner.stop(taskName, function(err){
      manager.remove(taskName);
      callback();
    });
  } 
};

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
