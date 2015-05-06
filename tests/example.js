// example 1
var TaskRunner = require('../lib/TaskRunner.js');
var tr = new TaskRunner();
tr.on('scheduler', function(type, pid, data){
  if(type == "task_exit"){
    console.log("TYPE", type);
    console.log("PID", pid);
    console.log("DATA", data);
  }

  if(type == "task_error"){
    console.log("TYPE", type);
    console.log("PID", pid);
    console.log("DATA", data);
  }
});
tr.startTask('hello2');

/*
setTimeout(function(){
  tr.stop();
}, 65000);
*/
