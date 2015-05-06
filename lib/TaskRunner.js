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
        switch(code){
          0: // normal execution, loop continues
          1: // negative delay, loop continues
            if(code === 0){
              self.emit('scheduler', 'task_exit', this.pid, 'The task '+taskName+' executed successfully. Start the task again.');
            }else{
              self.emit('scheduler', 'task_exit', this.pid, 'The task '+taskName+' have a negative delay. The task is not executed and loop continues');
            }

            debug('start the task again');
            self.startTask(taskName);
            break;
          2: // next execution date bigger than end date. loop ends
            self.emit('scheduler', 'task_exit', this.pid, 'The task '+taskName+' executed successfully. The loop task is over.');
            break;
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
