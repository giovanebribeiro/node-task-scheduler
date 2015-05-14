/**
 * @file lib/TaskRunner.js - This class controls all task processes
 * @author Giovane Boaviagem
 * @version 1.0.0
 */
(function(){
var cp = require('child_process'),
    events = require('events'),
    path = require('path'),
    utile = require('utile'),
    fs = require('fs'),
    TaskData = require('./TaskData.js');
    debug = require('debug')('node-task-scheduler:lib/TaskRunner');

var TaskRunner;

/**
 * @constructor
 * @this {TaskRunner}
 * @param manager The TaskManager object
 */
module.exports = TaskRunner = function(manager){
  this.manager = manager;
  this.threads = {};
};

utile.inherits(TaskRunner, events.EventEmitter);

/**
 * @static
 * @this {TaskRunner}
 * @param taskName - the name of the task
 * @return {string} The complete path of kill file.
 */
TaskRunner.getKillFile = function(taskName){
  return path.join(TaskData.getTasksDir(),taskName+'.kill');
};

/**
 * Starts a task, creating the child process for this task
 *
 * @public
 * @this {TaskRunner}
 * @param taskName - The name of the task
 */
TaskRunner.prototype.startTask = function(taskName){
  var child,
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
        debug("startTask() - EXIT CODE", code);
        debug("startTask() - EXIT SIGNAL", signal);

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

            debug('startTask() - start the task again');
            self.startTask(taskName);
            break;
          case 2: // next execution date bigger than end date. Loop ends
            self.emit('runner', 'task_exit', this.pid, {
              code: code,
              message: 'The task '+taskName+' executed successfully. The loop task is over.',
              task: taskName
            });

            debug("startTask() - removing the 'kill' file, if exists");
            if(fs.existsSync(TaskRunner.getKillFile(taskName))){
              fs.unlinkSync(TaskRunner.getKillFile(taskName));
            }

            if(self.manager.haveTask(taskName)){
              self.manager.remove(taskName);
            }

            debug("startTask() - Remove the task from task array");
            delete self.threads[taskName];
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

/**
 * Stops the task. The process will stop in next execution
 *
 * @public
 * @this {TaskRunner}
 * @param {string} taskName - The name of the task
 */
TaskRunner.prototype.stop = function(taskName){
  if(!fs.existsSync(TaskRunner.getKillFile(taskName))){
    fs.closeSync(fs.openSync(TaskRunner.getKillFile(taskName), 'w'));
  }
};

/**
 * kill this process
 *
 * @public
 * @this {TaskRunner}
 */
TaskRunner.prototype.kill = function(){
  process.kill();
};

/**
 * @public
 * @this {TaskRunner}
 * @param {string} taskName - the name of the task
 * @return {boolean} if task is running, or not.
 */
TaskRunner.prototype.isRunning = function(taskName){
  return this.threads.hasOwnProperty(taskName);
};

/**
 * @public
 * @this {TaskRunner}
 * @return {boolean} if the task queue is empty, or not.
 */
TaskRunner.prototype.isEmpty = function(){
  return (JSON.stringify(this.threads) == JSON.stringify({}));
};

})();
