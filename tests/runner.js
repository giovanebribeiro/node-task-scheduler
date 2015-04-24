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
    this.timeout(delay*10000*2);

    var ts = require('../lib/TaskScheduler.js');

    debug("Starting the pool");
    ts.runner.start();
    debug("Wait for 10 seconds");
    setTimeout(function(){
      debug("Creating the task");
      ts.manager.createTask('hello', function(){
        console.log("Hello World from Daemon!!");
      }, '*/'+delay+' * * * *', tomorrow, function(err, taskData){
        if(err) throw err;

        var i=0;

        debug("The task must be executed 5 times before end.");
        ts.runner.on('event', function(type, pid, msg){
          if(type === "task message"){

            if(i < 5){
              assert(msg.uptime == delay, "The task is not executed in correct delay.");
              i++;
            }else{
              done();
            }
            
          }
        });
      });
    }, 10000);

  
    /* 
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
    });*/

  });
});
