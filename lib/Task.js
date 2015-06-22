/**
 * @file lib/Task.js - Unit of execution of this framework
 * @author Giovane Boaviagem
 * @version 1.0.0
 * 
 * @param {string} The task name (passed by process.args)
 *
 */
(function(){
'use strict';

var tc = require("./TaskConstraints.js");
var TaskData = require('./TaskData.js');
var debug = require('debug')('node-task-scheduler:lib/Task');
var cronParser = require('cron-parser');
var path = require('path');
var f = require('./util/file.js');
var proc = process;
var TaskRunner = require('./TaskRunner');
var fs = require('fs');

var taskName = process.argv[2];
var tasksDir = process.argv[3];

var jsonTaskFile = path.join(tasksDir, taskName+".json");
var jsTaskFile = path.join(tasksDir, taskName+".js");
if(!f.exists(jsonTaskFile) || !f.exists(jsTaskFile)){
  process.exit(tc.exit_codes.loop_ends); //exit the task and end loop.
}

var killFile = TaskRunner.getKillFile(tasksDir, taskName);

debug('mounting the TaskData object');
var taskData = require(jsonTaskFile);
taskData.activity = require(jsTaskFile);
taskData.endDate = new Date(taskData.endDate);

debug(taskData);

var scheduler = cronParser.parseExpression(taskData.cron);

var Task;

/**
 * @contructor
 * @this {Task}
 */
module.exports = Task = function(){
  this.pid = process.pid;
};

/**
 * Send a message to master (Task Runner)
 *
 * @public
 * @this {Task}
 * @param {string} evt - Event name
 * @param {mixed} msg - Message to send. Can be anything
 */
Task.prototype.sendMessageToMaster = function(evt,msg){
  var uptime = process.uptime();
  if(process.send){
    process.send(evt, {
      uptime: uptime,
      message: msg
    });
  }
};

/**
 * Calculate the delay to setTimeout function
 *
 * @public
 * @this {Task}
 * @return {Number} The delay to execute the task (in milisseconds)
 */
Task.prototype.calculateDelay = function(){
  var startDate = Date.now();

  debug("calculateDelay() - generate the next execution date");
  var nextOcurrence = scheduler.next();

  debug("calculateDelay() - check if next execution date is bigger than endDate (other words, if the task is over)");
  if(taskData.endDate && ( (taskData.endDate.getTime() - nextOcurrence.getTime()) < 0) ){
    process.exit(tc.exit_codes.loop_ends);
  }

  debug("calculateDelay() - calculating the delay");
  // in natural order, the next ocurrence date is the date in future...
  var delay = nextOcurrence.getTime() - Date.now();
  
  return delay;
};

/**
 * Execute the task
 *
 * @public
 * @this {Task}
 */
Task.prototype.start = function(){
  var self = this;

  var delay = this.calculateDelay();
  debug("delay = ",delay);

  if(delay < 0){
    process.exit(tc.exit_codes.negative_delay); // negative delay
  }

  setTimeout(function(){
    // if kill file exists, the task is over
    debug("kill file: "+killFile);
    if(fs.existsSync(killFile)){
      debug("kill file exists, loop ends.");
      process.exit(tc.exit_codes.loop_ends);
    }else{
      taskData.activity(taskData.args, function(err, exitCode){
        if(err) throw err;

        debug("exit code before:", exitCode);
        
        if(!exitCode){
          exitCode = tc.exit_codes.unknown_exit_code;
        }

        debug("exit code after:", exitCode);

        process.exit(exitCode);
      });
    }
  }, delay);

};

// executing the task
var t = new Task();
t.start();

process.on('disconnect', function(){
  process.kill(process.pid);
});

process.on('message', function(message){
  debug("message received: ", message);
  if(message.stop){
    process.exit(tc.exit_codes.loop_ends);
  }
});

})();
