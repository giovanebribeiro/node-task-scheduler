var cp = require('child_process'),
    events = require('events'),
    path = require('path'),
    utile = require('utile');

var TaskRunner;

module.exports = TaskRunner = function(manager){
  this.manager = manager;
  this.threads = {};
};

utile.inherits(TaskRunner, events.EventEmitter);

TaskRunner.prototype.startTask = function(taskName){
  var debug = require('debug')('TaskRunner.startTask()'),
      child,
      self = this,
      onMessage = function(message){
        self.emit('scheduler', 'task_message', this.pid, message);
      },
      onError = function(error){
        self.emit('scheduler', 'task_error', this.pid, error);
      },
      /*onDisconnect = function(error){
        self.emit('scheduler', 'task_disconnect', this.pid, "Task disconected");
      },*/
      onExit = function(code){
        if(code == 0){
          self.emit('scheduler', 'task_exit', this.pid, 'The task '+taskName+' executed successfully. Start the task again.');
          debug('start the task again');
          self.startTask(taskName);
        } else{
          self.emit('scheduler', 'task_exit', this.pid, 'The task '+taskName+' executed successfully. The loop task is over.');
        }
      };

  child = cp.fork(path.join(__dirname, 'Task.js'), [taskName]);
  child.on('message', onMessage);
  child.on('error', onError);
  //child.on('disconnect', onDisconnect);
  child.on('exit', onExit);
  this.threads[taskName] = child; 
};

TaskRunner.prototype.stop = function(taskName){
  var self = this;

  if(typeof taskName == "undefined"){
    var allTaskNames = Object.keys(this.threads);
    allTaskNames.forEach(function(taskName){
      self.threads[taskName].disconnect();
    });
  }else if(this.threads[taskName]){
    self.threads[taskName].disconnect();
  }

};

TaskRunner.prototype.kill = function(){
  process.kill();
};
