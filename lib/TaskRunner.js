var cp = require('child_process'),
    events = require('events'),
    path = require('path'),
    utile = require('utile');

var TaskRunner;

module.exports = TaskRunner = function(){
  //this.manager = manager;
  this.threads = {};
};

utile.inherits(TaskRunner, events.EventEmitter);

TaskRunner.prototype.startTask = function(taskName){
  var debug = require('debug')('TaskRunner:startTask'),
      child,
      self = this,
      onMessage = function(message){
        self.emit('runner', 'task_message', this.pid, {
          message: message,
          task: taskName
        });
      },
      onError = function(error){
        self.emit('runner', 'task_error', this.pid, {
          message: error,
          code: error.code,
          task: taskName
        });
      },
      onDisconnect = function(error){
        self.emit('runner', 'task_disconnect', this.pid, {
          task: taskName,
          message: "Task "+taskName+" disconected from loop event."
        });
      },
      onExit = function(code, signal){
        debug("EXIT CODE", code);
        debug("EXIT SIGNAL", signal);

        // removing the child from threads array
        // delete self.threads[taskName];

        // handling the error codes
        switch(code){
          case 0: // normal execution, loop continues
          case 1: // negative delay, loop continues
            if(code === 0){
              self.emit('runner', 'task_loop', this.pid, {
                message: 'The task '+taskName+' executed successfully. Start the task again.',
                code: code,
                task: taskName
              });
            }else{
              self.emit('runner', 'task_loop', this.pid, {
                message: 'The task '+taskName+' have a negative delay. The task is not executed (implemented in child process) and loop continues.',
                code: code,
                task: taskName
              });
            }

            debug('start the task again');
            self.startTask(taskName);
            break;
          case 2: // next execution date bigger than end date. Loop ends
            self.emit('runner', 'task_exit', this.pid, {
              code: code,
              message: 'The task '+taskName+' executed successfully. The loop task is over.',
              task: taskName
            });

            debug("Remove the task from task array");
            delete self.threads[taskName];
            //self.manager.remove(taskName);
            break;
          default:
            self.emit('runner', 'task_error', this.pid, "Unknown exit code ("+code+").");
        }
      };

  // only fork if task exists in TaskManager
  child = cp.fork(path.join(__dirname, 'Task.js'), [taskName]);
  child.on('message', onMessage);
  child.on('error', onError);
  child.on('disconnect', onDisconnect);
  child.on('exit', onExit);
  this.threads[taskName] = child; 
};

TaskRunner.prototype.stop = function(taskName, callback){
  var self = this;

  if(this.threads[taskName]){

    self.threads[taskName].send({stop:true});

  }

  callback();
};

TaskRunner.prototype.kill = function(){
  process.kill();
};

TaskRunner.prototype.isRunning = function(taskName){
  return this.threads.hasOwnProperty(taskName);
};

TaskRunner.prototype.isEmpty = function(){
  return (JSON.stringify(this.threads) == JSON.stringify({}));
};
