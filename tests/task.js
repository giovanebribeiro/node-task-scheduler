var chai = require('chai');
var assert = chai.assert;
var util = require('util');
var path = require('path');
var TaskData = require('../lib/TaskData.js');
var forever = require('forever-monitor');
var debug = require('debug')('tests/task.js');

suite('Task tests', function(){
  var tomorrow;
  var taskMaster;
  var delay = 3;

  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    //taskMaster = new TestMaster();
  });

  test('- if task is executed in correct time (less or equal: '+delay+'s).', function(done){
    // set timeout to delay
    this.timeout(delay*1000*60);
    debug('creating the task');
    var helloTask1 = new TaskData('hello', function(){
      console.log("Hello World from hello");
    }, '*/'+delay+' * * * * *', tomorrow);


    debug('export to file');
    helloTask1.toFile(function(err){
      if(err) throw err;
      
      debug('creating the child');
      var dir = path.join(__dirname,'..','lib','Task.js');
      debug(dir);
      var child = new (forever.Monitor)(dir,{
        max:1,
        silent: true,
        args: ['hello']
      });

      var delayTest = delay * 1000;

      var startDate = Date.now();
      child.on('stdout', function(msg){
        console.log(msg.toString('utf-8'));
      });
      child.on('exit:code', function(code){
        var endDate = Date.now();
        var execTime = endDate - startDate;
        debug("execTime", execTime);
        // this event catches all console.log, for example.
        assert((execTime <= delayTest ), "The task is not executing in correct time");
        done();
      });
      child.start();

    });
  });
});
