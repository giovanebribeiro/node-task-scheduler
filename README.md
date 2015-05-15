# node-task-scheduler [![Build Status](https://travis-ci.org/giovanebribeiro/node-task-scheduler.svg?branch=master)](https://travis-ci.org/giovanebribeiro/node-task-scheduler)

A Task scheduler for node.js, with cron-syntax, specific execution intervals and due dates.

## Instalation
```bash
npm install --save node-task-scheduler
```

## Example usage
```
var ts=require('node-task-scheduler');
global.scheduler = ts; //available to all application

//starting previous tasks
ts.start(function(){
  console.log("Previous tasks loaded");
});

...

//adding task, to be executed each minute, until endDate
scheduler.addTask('hello', function(callback){
  console.log("Hello from hello! ");
  callback();
}, "0 * * * * *", endDate);

...

//removing the task
scheduler.removeTask('hello');
```

## API
| Function   | Description                                                                | Parameters (in order)                                                                                                            |
|------------|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| addTask    | Add (or update) a task to scheduler                                        | Task name. If the name is already assigned to other task, this task will be updated with these data.                             |
|            |                                                                            | Function to be executed. The function MUST have a callback with no params                                                        |
|            |                                                                            | Cron-string with the frequency of the task executions. Check this link (https://github.com/harrisiirak/cron-parser) for details. |
|            |                                                                            | Limit date to execute the task (optional).                                                                                       |
| removeTask | Removes the task scheduler.  The task process will stop in next iteration. | The task name                                                                                                                    |
| start      | Load tasks previously saved and starts them. It needs to be called once.   | Callback function without parameters                                                                                             |
| haveTask   | Check if task is present in scheduler                                      | The task name                                                                                                                    |
| isRunning  | Check if task is running                                                   | The Task name                                                                                                                    |## License
[MIT](http://opensource.org/licenses/MIT)
