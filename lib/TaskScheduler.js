/*
 * Main File
 */

var TaskManager = require('./TaskManager.js');
var TaskRunner = require('./TaskRunner.js');
var async = require('async');

var utile = require('utile');
var events = require('events');

var manager = new TaskManager();
var runner = new TaskRunner(manager);

var TaskScheduler = function(){
  this.initCalled = false;
  var that = this;

  // listeners
  runner.on('message', function(m){
    that.emit(m);
  });
};

utile.inherits(TaskScheduler, events.EventEmitter);

// Must be called once
TaskScheduler.prototype.init = function(cb){
  var debug = require('debug')('lib/TaskScheduler.js:init()');

  if(!this.initCalled){
    this.initCalled = true;
    var taskNames;

    async.series([
        function(callback){
          debug('loading the tasks');
          manager.loadTasks(function(err, _tasksSaved){
            if(err) return callback(err);

            taskNames = Object.keys(_tasksSaved);

            return callback();
          });
        },
        function(callback){
          debug('Starting the tasks');
          for(var i=0; i<taskNames.length; i++){
            var taskName = taskNames[i];
            
            debug('* Starting the task '+taskName);
            runner.start(taskName);
          }
          
          callback();
        }
    ], function(err){
      debug("Returning...");
      if(cb){
        debug("callback = true");
        cb(err);
      }else{
        if(err) throw err;
      }
    });
  }
};

// creates a task
TaskScheduler.prototype.createTask = function(name, activity, cronFreq, endDate, cb){
  var debug = require('debug')('lib/TaskScheduler.js:createTask()');
  
  debug("Creating the task...");
  manager.createTask(name, activity, cronFreq, endDate, function(err, taskData){
    if(err) throw err;

    debug("starting the task...");
    runner.start(taskData.name);

    if(cb){
      cb(err);
    }
  });
};

//
TaskScheduler.prototype.haveTask = function(taskName){
  return manager.tasksSaved.hasOwnProperty(taskName);
};

//
TaskScheduler.prototype.clean = function(){
  runner.stop();
  manager.clean();
};

module.exports = new TaskScheduler();
