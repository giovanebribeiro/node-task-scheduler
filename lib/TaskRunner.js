/*
 * File: lib/TaskRunner.js
 * Author: Giovane Boaviagem
 *
 * Executes the Task with fork.
 */
(function(){
'use strict';

var debug = require('debug')('TaskRunner');
var TaskData = require('./TaskData.js');
var later = require('later');

require('./util/date.js');

var TaskRunner;

// convertendo as datas em String para Date.
var taskName = process.argv[2];
debug("TASKDATA_ARGV: "+taskName);

var delayInterval = 1*1000; // delay between executions: 1s
var pid = process.pid;

module.exports = TaskRunner = function(){
  this.taskData = TaskData.toTaskData(taskName);
  this.times = [];

  // mounting the dates array
  var scheduler = later.schedule(later.parse.cron(this.taskData.cron, true));
  var startDate = new Date();
  do{
    var _date = scheduler.next(1, startDate);
    this.times.push(_date);

    if(_date.compare(this.taskData.endDate)){
      break;
    }

  }while(true);
};

// Send a message to master when task is finished.
TaskRunner.prototype.sendMessage = function(){
  var now = new Date();
  var uptime = process.uptime();
  var message = now.toString()+" - Task "+this.taskData.name+"["+pid+"] executed with upset "+uptime+"ms.";
  process.send({
    custom: message
  }); 
};

// execute the activity, but only in time. 
TaskRunner.prototype.execute = function(){
  var now = new Date();

  debug(this.taskData.toString(), "RUNNING!");

  for(var i = 0; this.times.length; i++){
    if(now.compare(this.times[i])){
      this.taskData.activity();
      sendMessage();
      break;
    }
  }

  /*
  for(var i=0; i < datesToExecute.length; i++){
    var dateToExecute = datesToExecute[i];

    if(dateToExecute.getTime() == now.getTime()){
      // se as datas baterem, execute a task
      //require(filename)();
      hello();
      this.sendMessage();
      break;
    }
  }
  */
};

var start = function(){
  setInterval(this.execute.bind(this), this.delayInterval);
  this.sendMessage();
};
TaskRunner.prototype.start = start;

/*
 * Starting the task.
 */
var t = new TaskRunner();
t.start();

process.on('disconnect', function(){
  process.kill();
});

/*
  var child,
  onMessage = function(message){
    that.emit('event', 'child message', this.pid, message);
  },
  onError = function(err){
    that.emit('event', 'child error', this.pid, err);
  },
  onDisconnect = function(err){
    that.emit('event', 'child disconnect', this.pid, 'killing...');
    this.kill();
    that.tasksSaved[taskData.name].thread = undefined;
  };
/*
 * Stop the thread specified. If pid is undefined,
 * all threads will stop.
 
TaskManager.prototype.stop = function(pid){
  var debug = require('debug')('lib/TaskManager:stop');
  var that = this;

  if(typeof pid === "undefined"){
    var allPids = Object.keys(this.threads);
    allPids.forEach(function(key, i, arr){
      that.threads[key].disconnect();
    });
  }else if( threads[pid] ){
    that.threads[pid].disconnect();    
  }
};
/*
 * Destroy the process

TaskManager.prototype.destroy = function(){
  process.kill();
};


*/

})();
