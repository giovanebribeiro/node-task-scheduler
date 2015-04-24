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

var _delay = process.argv[2];
var _taskName = process.argv[3];
debug('Task name: '+_taskName);

var Task;

module.exports = Task = function(){
  this.delay = _delay;
  this.taskName = _taskName;
  this.pid = process.pid;
};

Task.prototype.sendStatusMessage = function(){
  var uptime = process.uptime();
  var message = "("+this.pid+") Task '"+this.taskName+"' executed with uptime "+uptime+"ms";

  process.send({
    custom: message,
    uptime: uptime,
    taskName: this.taskName
  });
};

Task.prototype.start = function(){
  var self = this;
  TaskData.toTaskData(this.taskName,function(taskData){
    setTimeout(function(){
      self.sendStatusMessage();
      taskData.activity();
    }, self.delay);

  });
};

process.on('disconnect', function(){
  process.kill();
});

// starting...
var t = new Task();
t.start();
})();
