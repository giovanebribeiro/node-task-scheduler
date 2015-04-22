/*
 * File: lib/TaskRunner.js
 * Author: Giovane Boaviagem
 *
 * Fork the process loop
 */
(function(){
'use strict';

var cp = require('child_process');
var events = require('events');
var path = require('path');
var util = require('util');

var TaskRunner;

module.exports = TaskRunner = function(){
  this.threads = {};
};

util.inherits(TaskRunner, events.EventEmitter);

TaskRunner.prototype.start = function(){
 var child,
  that = this,
  onMessage = function(message){
    that.emit('event', 'child message', this.pid, message);
  },
  onError = function(err){
    that.emit('event', 'child error', this.pid, err);
  },
  onDisconnect = function(err){
    that.emit('event', 'child disconnect', this.pid, 'Killing...');
    this.kill();
    delete that.threads[this.pid];
  };

  child = cp.fork(__dirname + path.sep + 'TaskProcess.js');
  child.on('message', onMessage);
  child.on('error', onError);
  child.on('disconnect', onDisconnect);
  that.threads[child.pid] = child;
};

TaskRunner.prototype.stop = function(pid){
  var that = this;

  if(typeof pid == 'undefined'){
    var allPids = Object.keys(that.threads);
    allPids.forEach(function(key, i, arr){
      that.threads[key].disconnect();
    });
  }else if(that.threads[pid]){
    that.threads[pid].disconnect();
  }
};

TaskRunner.prototype.destroy = function(){
  process.kill();
};

/*module.exports = {
  start: function(){
    child = cp.fork(__dirname + '/TaskProcess.js');
  }
};*/

/*
var args = [taskData.name];
child = cp.fork(__dirname+'/TaskRunner.js', args);
child.on('message', onMessage);
child.on('error', onError);
child.on('disconnect', onDisconnect);
taskData.thread = child;
that.tasksSaved[taskName] = taskData;
*/


})();
