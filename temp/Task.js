var TaskData = require('../lib/TaskData.js');


var taskName = process.argv[2];

TaskData.toTaskData("helloTask1", function(taskData){
  taskData.activity();

  if(process.send){
    process.send('message', "Task "+taskName+" executed successfully.");
  }

});


