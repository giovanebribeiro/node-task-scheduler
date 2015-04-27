var ts = require('../lib/TaskScheduler.js');

console.log("Cleaning the tasks");
ts.manager.clean();

console.log('Starting the daemon');
ts.runner.start();

console.log("Creating a task");
ts.manager.createTask("hello", function(){
  console.log("Hello World!!");
}, "* * * * *", undefined, function(err, taskData){
 if(err) throw err; 
});

console.log("Monitoring the events");
ts.runner.on('event', function(type, pid, message){
  console.log(message);
});

console.log(processes);
