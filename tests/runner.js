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

    //ts.runner.start();
    debug("Creating the task");
    ts.manager.createTask('hello', function(){
      var f = require('fs');
      var path = require('path');
      var homedir = (process.platform == "win32")? process.env.HOMEPATH : process.env.HOME;
      f.writeFile(path.join(homedir,path.sep,Math.random(),'.txt'), 'Hello World from deamon!!', function(err){
        if(err) throw err;
      });
    }, '*/'+delay+' * * * *', tomorrow, function(err, taskData){
      if(err) throw err;
      ts.runner.start();
      
      var i=0;

      setTimeout(function(){
        done();
      }, delayTimeout - 100);

    });

    
  });
});
