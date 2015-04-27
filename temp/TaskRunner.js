var events = require('events');
var child_process = require('child_process');
var spawn = child_process.spawn;
var utile = require('utile');
var path = require('path');

var TaskRunner = module.exports = function(taskName){
  this.taskName = taskName;
  this.running = false;
  this.ctime = undefined;
  this.child = undefined;
};

utile.inherits(TaskRunner, events.EventEmitter);

TaskRunner.prototype.start = function(restart){
  var self = this;
  var child;

  if(this.running && !restart){
    process.nextTick(function(){
      self.emit('error', new Error("Cannot start process that is already running..."));
    });
    return this;
  }

  child = this.trySpawn(); // create the process here
  if(!child){
    process.nextTick(function(){
      self.emit('error', new Error('Task name not matches with any task...'));
    });
    return this;
  }

  // the task is running now.
  this.ctime = Date.now();
  this.running = true;
  this.child = child;

  function onMessage(msg){
    self.emit('message', msg);
  }

  this.child.on('message', onMessage);

  child.on('exit', function(code, signal){
    child.removeListener('message', onMessage);

    self.emit('exit:code', code, signal);

    function killChild(){
      self.running = false;
      self.emit('exit', self);
    }

    function restartChild(){
      process.nextTick(function(){
        self.start(true);
      });
    }
  });

  return this;
};

TaskRunner.prototype.trySpawn = function(){
  args = [path.join(__dirname, path.sep, 'Task.js'), this.taskName];
  return spawn('node', args);
};

/*
 * only for tests
 */
var tr = new TaskRunner('helloTask1');
tr.on('exit', function(){
  console.log("Done!");
});
tr.start(false);
