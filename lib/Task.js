/*
 * Unit of execution of this framework
 *
 * Parameters (passed by process.args)
 * delay to execute
 * task name
 */

(function(){
'use strict';

var TaskData = require('./TaskData.js');
var debug = require('debug')('lib/Task.js');
var cronParser = require('cron-parser');
var path = require('path');
var proc = process;

var taskName = process.argv[2];

debug('mounting the TaskData object');
var taskData = require(path.join(TaskData.getTasksDir(), taskName+".json"));
taskData.endDate = new Date(taskData.endDate);
taskData.activity = require(path.join(TaskData.getTasksDir(), taskName+".js"));

debug(taskData);

var scheduler = cronParser.parseExpression(taskData.cron);

var Task;

module.exports = Task = function(){
  this.pid = process.pid;
};

Task.prototype.sendMessageToMaster = function(evt,msg){
  var uptime = process.uptime();
  if(process.send){
    process.send(evt, {
      uptime: uptime,
      message: msg
    });
  }
};

Task.prototype.calculateDelay = function(){
  var startDate = Date.now();

  //debug("calculateDelay() - generate the next execution date");
  var nextOcurrence = scheduler.next();

  //debug("calculateDelay() - check if next execution date is bigger than endDate (other words, if the task is over)");
  debug("taskData.endDate.getTime() - nextOcurrence.getTime()", (taskData.endDate && (taskData.endDate.getTime() - nextOcurrence.getTime()) < 0));
  if(taskData.endDate && ( (taskData.endDate.getTime() - nextOcurrence.getTime()) < 0) ){
    process.exit(1);
  }

  //debug("calculateDelay() - calculating the delay");
  // in natural order, the next ocurrence date is the date in future...
  var delay = nextOcurrence.getTime() - Date.now();
  
  return delay;
};

// execute the task
Task.prototype.start = function(){
  var self = this;
  var delay = this.calculateDelay();
  debug("delay = ",delay);

  if(delay < 0){
    process.exit(0);     
  }

  setTimeout(function(){
    taskData.activity(function(err){
      if(err) throw err;
      process.exit(0);
    });
  }, delay);

};

// executing the task
var t = new Task();
t.start();

process.on('disconnect', function(){
  process.kill();
});

})();
