var TaskManager = require('./TaskManager.js');
var TaskRunner = require('./TaskRunner.js');
var events = require('events');
var utile = require('utile');

var TaskScheduler = function(){
  this.runner = new TaskRunner();
  this.manager = new TaskManager();
  this.init = false;
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

  if(!this.init){
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

      self.init = true;
      cb();
    });
  }
};

TaskScheduler.prototype.addTask = function(){};

module.exports = TaskScheduler;
