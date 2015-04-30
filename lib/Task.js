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

//var _delay = process.argv[2];
var taskName = process.argv[2];

debug('mounting the TaskData object');
var taskData = require(path.join(TaskData.getTasksDir(), taskName+".json"));
taskData.endDate = new Date(taskData.endDate);
taskData.activity = require(path.join(TaskData.getTasksDir(), taskName+".js"));

debug(taskData);

process.on('exit', function(code, signal){
  var msg = {
    uptime: process.uptime(),
    code: code,
    signal: signal,
    content: "The task is over"
  };
  if(process.send){
    process.send(msg);
  }
});

if(taskData.endDate){
  // if startDate is bigger than endDate, the task is over.
  var startDate = new Date();
  if(startDate > taskData.endDate.getTime()){
    process.send('exit', 1);
  }else{
    debug('calculating the delay');
    var scheduler = cronParser.parseExpression(taskData.cron);
    var nextOcurrence = scheduler.next();
    startDate = new Date();
    debug("Start date:", startDate);
    debug("Next ocurrence:", nextOcurrence);
    debug("Next next ocurrence:", scheduler.next());
    var delay = nextOcurrence.getTime() - startDate.getTime();
    debug("delay", delay);
    if(delay < 0){
      delay = 0;
    }

    var msg;
    
    debug('set delay to execute the task');
    setTimeout(function(){
      taskData.activity();
    }, delay);
  }
}


})();
