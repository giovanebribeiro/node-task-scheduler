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

require('./util/date.js');

var TaskRunner;

// convertendo as datas em String para Date.
var taskData_argv = process.argv[2];
debug("TASKDATA_ARGV: "+taskData_argv.name);

var delayInterval = 1*1000; // delay between executions: 1s
var pid = process.pid;

module.exports = TaskRunner = function(){
  this.taskData = taskData_argv;
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

  debug(this.taskData.toString());

  do{
    var execDate = this.taskData.cron.iterator.next();
    if(now.compare(execDate)){
      this.taskData.activity();
      sendMessage();
      break;
    }
  }while(true);

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

})();
