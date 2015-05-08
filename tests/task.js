var chai = require('chai');
var assert = chai.assert;
var path = require('path');
var TaskData = require('../lib/TaskData.js');
var debug = require('debug')('tests/task.js');
var cp = require('child_process');

suite('Task tests', function(){
  var tomorrow;
  var delay = 1;

  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
  });

  test('- if task is executed in correct time (less or equal: '+delay+'min).', function(done){
    // set timeout to delay
    this.timeout(delay*1000*60*2);
    debug('creating the task');
    var helloTask1 = new TaskData('hello', function(callback){
      console.log("Hello World from hello");
      callback();
    }, '0 */'+delay+' * * * *', tomorrow);

    var delayTest = delay*1000*60;

    debug('export to file');
    helloTask1.toFile(function(err){
      if(err) throw err;
      
      debug('creating the child');
      var dir = path.join(__dirname,'..','lib','Task.js');

      var startDate = Date.now();
      var child = cp.fork(dir,['hello']);
      child.on('exit', function(code){
        var endDate = Date.now();
        var execTime = endDate - startDate;
        assert((execTime <= delayTest ), "The task is not executing in correct time"); 
        helloTask1.destroyFiles(); 
        done();
      });

    });

  });

});
