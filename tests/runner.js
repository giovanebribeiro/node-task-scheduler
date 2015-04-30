var chai = require('chai');
var assert = chai.assert;
var debug = require('debug')('tests/runner.js');
var ts = require('../lib/TaskScheduler.js');

suite('TaskRunner tests', function(){
  var tomorrow;
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

    debug("Starting the pool");
    ts.clean();

    //ts.runner.start();
   
    var name = "hello";
    var activity = function(){
     console.log("Hello World from hello!!");
    };
    var cronFreq = '* * * * * *';
    var endDate = tomorrow;

    ts.createTask(name, activity, cronFreq, endDate, function(err){
     if(err) throw err;

     var i=0;

     ts.on('task_end', function(m){
       console.log("i = "+i);
       if(i < 5){
        console.log(m);
        i++;
       }else{
        done();
       }
     });
    
    }); 
    
  });
});
