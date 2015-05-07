// example 1
/*
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

setTimeout(function(){
  tr.stop();
}, 65000);
*/

// example 2
var TaskRunner = require('../lib/TaskRunner.js');
var TaskManager = require('../lib/TaskManager.js');

var tm = new TaskManager();

tm.loadTasks(function(err, tasksSaved){
  if(err) throw err;

  var tr = new TaskRunner(tm);

  // start task (every minute, with end date to 5 minutes)
  tr.startTask('hello');

  // create a new task and run it (every 3 minutes, end date to 2h)
  tm.createTask('hello2', function(callback){
    console.log("Hello World from hello2!! "+new Date());
    callback();
  }, '0 */3 * * * *', new Date("Wed May 6 2015 23:00:00 GMT-0300 (BRT)"), function(err, taskData){
    if(err) throw err;

    tr.startTask("hello2");
  });

});



