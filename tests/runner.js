var chai = require('chai');
var assert = chai.assert;
var debug = require('debug')('tests/runner.js');

suite('TaskRunner tests', function(){
  var tomorrow;
  var ts;
  var delay;

  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    delay = 3;
  });

  test('- if pool of threads are created.', function(done){
    // set timeout to delay
    var delayTimeout = delay+10000*8;
    this.timeout(delayTimeout);
    var ts = require('../lib/TaskScheduler.js');

    debug("Starting the pool");
    ts.manager.clean();

    ts.runner.start();
    debug("Creating the task");
    ts.manager.createTask('hello', function(){
      console.log("Hello World from Daemon!!");
    }, '*/'+delay+' * * * *', tomorrow, function(err, taskData){
      if(err) throw err;
    });

    var i=0;

    setTimeout(function(){
      done();
    }, delayTimeout);

  });
});
