var cp = require('child_process');
var events = require('events');
var path = require('path');
var util = require('util');
var TaskData = require('../models/TaskData.js');
var logger = require('./logger');

var TaskScheduler;

module.exports = TaskScheduler = function(){
  this.taskData = [];
  this.threads = {}; // threads executadas. 
};
/* 
 * Make the TaskScheduler subclass of EventEmitter
 */
util.inherits(TaskScheduler,events.EventEmitter);
/* 
 * Starts the pool of threads
 */
TaskScheduler.prototype.start = function(){
  var that = this;
  TaskData.find(function(err, tasks){
    if(err) throw err;

     
    // starting the threads
    if(!tasks.length){
      logger.debug("TaskScheduler.start() - empty task list. Nothing to do.");
      return;
    }
   
    logger.debug("TaskScheduler.start() - loading tasks data");
    this.taskData = tasks;

    if(!this.threads){
      this.threads = {};
    }

    logger.debug("TaskScheduler.start() - Starting the threads");
    var i,
    task,
    onMessage = function(message){
      // this.pid se refere ao CHILD. o objeto 'this' referente ao master foi
      // renomeado para 'that' para evitar conflitos
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
    
    // starting the threads
    for(i = 0; i < this.taskData.length; i++){
      logger.silly("TaskScheduler.start() - Data: "+this.taskData[i].filename);

      var datesToExecute = this.taskData[i].datesToExecute;
      var filename = this.taskData[i].filename;

      var args = [datesToExecute, filename];
      child = cp.fork(__base+'lib/task.js', args);
      child.on('message', onMessage);
      child.on('error', onError);
      child.on('disconnect', onDisconnect);
      that.threads[child.pid] = child;
    }
  });
};
/*
 *
 */
TaskScheduler.prototype.addTask = function(filename, freq, endDate){
  TaskData.add(filename, freq, endDate, function(err, task){
    if(err && err.message.indexOf("duplicate key")<= -1){
      throw err;
    }

    // após adicionar ao banco, vamos iniciar a thread.
    // ...
  });
};
