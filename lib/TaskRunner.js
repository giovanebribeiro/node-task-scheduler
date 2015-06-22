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
    TaskData = require('./TaskData.js'),
    debug = require('debug')('node-task-scheduler:lib/TaskRunner'),
    tc = require('./TaskConstraints.js');

var TaskRunner;

/**
 * @constructor
 * @this {TaskRunner}
 * @param manager The TaskManager object
 */
module.exports = TaskRunner = function(manager){
  this.manager = manager;
  this.threads = {};
  this.tasksDir = manager.tasksDir;
};

utile.inherits(TaskRunner, events.EventEmitter);

/**
 * @static
 * @this {TaskRunner}
 * @param taskName - the name of the task
 * @return {string} The complete path of kill file.
 */
TaskRunner.getKillFile = function(tasksDir, taskName){
  return path.join(tasksDir, taskName+'.kill');
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

        var exit_codes = tc.exit_codes;

        // handling the error codes
        switch(code){
          case exit_codes.negative_delay: 
           
            debug("negative delay, sending the 'task_loop' event and loop continues"); 
            self.emit('runner', 'task_loop', this.pid, {
              message: 'The task '+taskName+' have a negative delay. The task is not executed (implemented in child process) and loop continues.',
              code: code,
              task: taskName
            });// normal execution, loop continues

            debug('startTask() - start the task again');
            self.startTask(taskName); 
            
            break;
          case exit_codes.loop_ends:

            debug("Sending the 'task_exit' event");
            self.emit('runner', 'task_exit', this.pid, {
              code: code,
              message: 'The task '+taskName+' executed successfully. The loop task is over.',
              task: taskName
            });

            debug("startTask() - removing the 'kill' file, if exists");
            if(fs.existsSync(TaskRunner.getKillFile(self.tasksDir, taskName))){
              fs.unlinkSync(TaskRunner.getKillFile(self.tasksDir, taskName));
            }

            if(self.manager.haveTask(taskName)){
              self.manager.remove(taskName);
            }

            debug("startTask() - Remove the task from task array");
            delete self.threads[taskName];

            debug("startTask() - array threads after remove: ", Object.keys(self.threads)); 

            break;

          case exit_codes.unknown_exit_code:
          /* falls through */
          default:

            debug("Sending the 'task_loop' message");
            self.emit('runner', 'task_loop', this.pid, {
              message: 'The task '+taskName+' executed successfully. Start the task again.',
              code: code,
              task: taskName
            });

            debug('startTask() - start the task again');
            self.startTask(taskName);
            
            break;
        }
      };

  // only fork if task exists in TaskManager
  child = cp.fork(path.join(__dirname, 'Task.js'), [taskName, self.tasksDir]);
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
TaskRunner.prototype.stop = function(taskName, cb){
  debug("stop() - Task file to write:"+TaskRunner.getKillFile(this.tasksDir, taskName));
  
  fs.open(TaskRunner.getKillFile(this.tasksDir, taskName), 'w', function(err, fd){
  
    // if the file not exists, it created automatically
    debug("stop() - creating the buffer in file");
    var buffer = new Buffer(taskName);

    debug("stop() - writing the buffer in file");
    fs.write(fd, buffer, 0, buffer.length, null, function(err){
      if(err) throw new Error("Error writing file: "+TaskRunner.getKillFile(this.tasksDir));

      debug("stop() - closing the file");
      fs.close(fd, function(){
        debug("stop() - file closed.");

        cb();  
      });

    });


  });

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
