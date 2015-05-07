var TaskManager = require('./TaskManager.js');
var TaskRunner = require('./TaskRunner.js');
var events = require('events');
var utile = require('utile');

var TaskScheduler = function(){
  this.runner;
  this.manager = new TaskManager();
  this.initialized = false;
};

utile.inherits(TaskScheduler, events.EventEmitter);

TaskScheduler.prototype.init = function(cb){
  var self = this;
  var debug = require('debug')('TaskScheduler.init()');

  debug('Load stored tasks');
  this.manager.loadTasks(function(err, tasksSaved){
    if(err) throw err;

    debug('Creating the TaskRunner object');
    self.runner = new TaskRunner(self.manager);
    
    debug('Create the event listener');
    self.runner.on('runner', function(type, pid, data){
      self.emit('scheduler', type, pid, data);
    });

    debug("Start the tasks");
    var taskNames = Object.keys(tasksSaved);
    for(var i=0; i<taskNames.length; i++){
      var taskName = taskNames[i];
      self.runner.startTask(taskName);
    }

    self.initialized = true;
    cb();
  });
};

module.exports = TaskScheduler;
