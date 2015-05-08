var TaskManager = require('./TaskManager.js');
var TaskRunner = require('./TaskRunner.js');
var events = require('events');
var utile = require('utile');

var runner = new TaskRunner();
var manager = new TaskManager();

var TaskScheduler = function(){};

utile.inherits(TaskScheduler, events.EventEmitter);

TaskScheduler.prototype.start = function(cb){
  var self = this;
  var debug = require('debug')('TaskScheduler.start()');

  // adding listeners
  runner.on('runner', function(type, pid, data){
    self.emit("scheduler", type, pid, data);

    // if the task is over, remove it from TaskManager array.
    if(type === "task_exit"){
      self.manager.remove(data.task);  
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

TaskScheduler.prototype.addTask = function(name, activity, cronFreq, endDate){
 var self = this;
 // stops the task in thread array, if exists
 if(runner.isRunning(name)){
   runner.stop(name);
 }

 manager.createTask(name, activity, cronFreq, endDate, function(err, taskData){
  if(err) throw err;

  // after create, start the task.
  self.runner.startTask(name);
 });
};

TaskScheduler.prototype.removeTask = function(taskName){
  // stopping the task, and remove it
  if(runner.isRunning(taskName)){
    runner.stop(taskName);
    manager.remove(taskName);
  } 
};

module.exports = TaskScheduler;
