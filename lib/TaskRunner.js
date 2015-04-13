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

var Task;

// convertendo as datas em String para Date.
var taskName = process.argv[2];

var delayInterval = 1*1000; // delay between executions: 1s
var pid = process.pid;

module.exports = Task = function(){
  this.taskData = TaskData.toTaskData(taskName);
};

// Send a message to master when task is finished.
var sendMessage = function(){
  var now = new Date();
  var uptime = process.uptime();
  var message = now.toString()+" - Task "+filename+"["+pid+"] executed with upset "+uptime+"ms.";
  process.send({
    custom: message
  }); 
};

// Executa a task, mas somente se estiver na data correta
Task.prototype.execute = function(){
  var now = new Date();

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

Task.prototype.start = function(){
  setInterval(this.execute.bind(this), this.delayInterval);
  this.sendMessage();
};

var t = new Task();
t.start();

process.on('disconnect', function(){
  process.kill();
});

})();
