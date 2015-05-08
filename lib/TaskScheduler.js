var TaskManager = require('./TaskManager.js');
var TaskRunner = require('./TaskRunner.js');
var events = require('events');
var utile = require('utile');

var TaskScheduler = function(){
  this.runner = new TaskRunner();
  this.manager = new TaskManager();
};

utile.inherits(TaskScheduler, events.EventEmitter);

TaskScheduler.prototype.start = function(cb){
  var self = this;
  var debug = require('debug')('TaskScheduler.start()');

  // adding listeners
  this.runner.on('runner', function(type, pid, data){
    self.emit("scheduler", type, pid, data);

    // if the task is over, remove it from TaskManager array.
    if(type === "task_exit"){
      self.manager.remove(data.task);  
    }
  });

  if(this.runner.isEmpty()){
    debug('Load stored tasks');
    this.manager.loadTasks(function(err, tasksSaved){
      if(err) throw err;

      debug("Start the tasks");
      var taskNames = Object.keys(tasksSaved);
      for(var i=0; i<taskNames.length; i++){
        var taskName = taskNames[i];
        debug("starting task "+taskName);
        self.runner.startTask(taskName);
      }

      cb();
    });
  }
};

TaskScheduler.prototype.addTask = function(name, activity, cronFreq, endDate){
 var self = this;
 // stops the task in thread array, if exists
 if(this.runner.isRunning(name)){
   this.runner.stop(name);
 }

 this.manager.createTask(name, activity, cronFreq, endDate, function(err, taskData){
  if(err) throw err;

  // after create, start the task.
  self.runner.startTask(name);
 });
};

module.exports = TaskScheduler;
