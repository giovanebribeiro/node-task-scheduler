var chai = require('chai');
var assert = chai.assert;
var cp = require('child_process');
var events = require('events');
var util = require('util');
var path = require('path');
var TaskData = require('../lib/TaskData.js');


/*************************************
 *** OBJECT TO SIMULATE THE MASTER ***
 *************************************/
var TestMaster = function(){};

util.inherits(TestMaster, events.EventEmitter);

TestMaster.prototype.start = function(delay, taskName){
  var child,
      that = this,
      onMessage = function(uptime,message){
        that.emit('event', 'test child message', this.pid, uptime, message);
      },
      onError = function(err){
        that.emit('event', 'test child error', this.pid, err);
      },
      onDisconnect = function(err){
        that.emit('event', 'test child disconnect', this.pid, 'killing...');
        this.kill();
      };

  var args = [delay, taskName];

  child = cp.fork(path.join(__dirname,'..',path.sep,'lib',path.sep,'Task.js'), args);
  child.on('message', onMessage);
  child.on('error', onError);
  child.on('disconnect', onDisconnect);
};

/*****************************
 *** END CLASS DECLARATION ***
 *****************************/

suite('Task tests', function(){
  var tomorrow;
  var taskMaster;
  var delay;

  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    taskMaster = new TestMaster();
    delay = 3;
  });

  test('- if task is executed in correct time.', function(done){
    // set timeout to delay
    this.timeout(delay*1000*2);
    // create the task
    var helloTask1 = new TaskData('hello', function(){
    console.log("Hello World!");
  }, '* * * * *', tomorrow);

    // convert to file
    helloTask1.toFile(function(err){
      if(err) throw err;

      var delayTest = delay;

      // forking the process
      taskMaster.start(delay*1000, 'hello');
      taskMaster.on('event', function(type, pid, msg){
        if(type === "test child message"){
          assert(msg.uptime == delay, "The task is not executed in correct delay.");
          //helloTask1.destroyFiles();
          done();
        }
      });
    });
  });
});
