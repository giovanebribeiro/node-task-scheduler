var ts = require('../lib/TaskScheduler.js');

ts.on('stdout', function(m){
  console.log(m);
});
var homeFolder = process.env[(process.platform == 'win32')? 'USERPROFILE' : 'HOME'];

ts.init(function(err){
  if(err) throw err;

  var fs = require('fs');

  console.log("starting the new task..");
  
  setTimeout(function(){

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // create/modifies the task with name "hello"
    ts.createTask('hello2', function(){
      console.log("Hello World! "+new Date());
    }, '0 */3 * * * *', tomorrow);  

  }, 10000);
  
});
