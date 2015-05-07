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
        self.emit('runner', 'task_message', this.pid, message);
      },
      onError = function(error){
        self.emit('runner', 'task_error', this.pid, error);
      },
      /*onDisconnect = function(error){
        self.emit('scheduler', 'task_disconnect', this.pid, "Task disconected");
      },*/
      onExit = function(code, signal){
        debug("EXIT CODE", code);
        debug("EXIT SIGNAL", signal);

        // removing the child from threads array
        delete self.threads[taskName];

        // handling the error codes
        switch(code){
          case 0: // normal execution, loop continues
          case 1: // negative delay, loop continues
            if(code === 0){
              self.emit('runner', 'task_message', this.pid, 'The task '+taskName+' executed successfully. Start the task again.');
            }else{
              self.emit('runner', 'task_message', this.pid, 'The task '+taskName+' have a negative delay. The task is not executed (implemented in child process) and loop continues.');
            }

            debug('start the task again');
            self.startTask(taskName);
            break;
          case 2: // next execution date bigger than end date. Loop ends
            self.emit('scheduler', 'task_exit', this.pid, 'The task '+taskName+' executed successfully. The loop task is over.');

            debug("Remove the task from Task manager");
            self.manager.remove(taskName);
            break;
          default:
            self.emit('runner', 'task_error', this.pid, "Unknown exit code ("+code+").");
        }
      };

  // only fork if task exists in TaskManager
  if(this.manager.haveTask(taskName)){
    child = cp.fork(path.join(__dirname, 'Task.js'), [taskName]);
    child.on('message', onMessage);
    child.on('error', onError);
    //child.on('disconnect', onDisconnect);
    child.on('exit', onExit);
    this.threads[taskName] = child; 
  }
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
