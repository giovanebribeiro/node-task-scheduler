var chai = require('chai');
var assert = chai.assert;
var debug = require('debug')('tests/runner.js');
var ts = require('../lib/TaskScheduler.js');

suite('TaskRunner tests', function(){
  var tomorrow;
  var delay = 3;

  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
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
    var cronFreq = '*/'+delay+' * * * * *';
    var endDate = tomorrow;

    ts.createTask(name, activity, cronFreq, endDate, function(err){
     if(err) throw err;

     var i=0;
    
     var startTime = new Date();
     ts.on('stdout', function(m){
       if(i < 5){
        //console.log(m);
        var endTime = new Date();
        console.log("End time: "+endTime);
        console.log("Exec time:", endTime.getTime() - startTime.getTime());
        i++;
       }else{
        done();
       }
     });
    
    }); 
    
  });
});
