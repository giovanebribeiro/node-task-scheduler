# node-task-scheduler [![Build Status](https://travis-ci.org/giovanebribeiro/node-task-scheduler.svg?branch=master)](https://travis-ci.org/giovanebribeiro/node-task-scheduler) [![npm version](https://badge.fury.io/js/node-task-scheduler.svg)](http://badge.fury.io/js/node-task-scheduler)

A Task scheduler for node.js, with cron-syntax, specific execution intervals and due dates.

## Instalation
```bash
npm install --save node-task-scheduler
```

## Example usage
```
var ts=require('node-task-scheduler');
global.scheduler = ts; //available to entire application

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
|            |                                                                            | Function to be executed. The function MUST have a callback                                                        |
|            |                                                                            | Cron-string with the frequency of the task executions. Check this link (https://github.com/harrisiirak/cron-parser) for details. |
|            |                                                                            | Limit date to execute the task (optional).                                                                                       |
| removeTask | Removes the task scheduler.  The task process will stop in next iteration. | The task name                                                                                                                    |
| start      | Load tasks previously saved and starts them. It needs to be called once.   | Callback function without parameters                                                                                             |
| haveTask   | Check if task is present in scheduler                                      | The task name                                                                                                                    |
| isRunning  | Check if task is running                                                   | The Task name                                                                                                                    |

## Events
The node-task-scheduler also have events support. You can easily monitore the 'scheduler' event. The event function have 3 parameters: the type message, task process pid, and the 'msg' object, which have 3 properties:
 
 * code: The message code
 * message: The event message
 * task: the task name

```
scheduler.on('scheduler', function(type, pid, msg){
	switch(type){
		case 'task_loop':
			// When an execution is over and the next execution starts
			if(code===0){
				// normal execution, loop continues
			}else if(code === 1){
				// The task have a negative delay. The task is not executed in this iteration and the loop continues. 
			}
			break;
		case 'task_exit':
			// Task`s last execution. Loop ends.
			break;
		case 'task_error':
			// task error. Loop ends.
		break;
		default: break;
	}
})
```

## Callback parameters and exit codes
The callback function have 2 parameters:
- The error object, and
- The exit code

But, the parameters are not required. So, the following callback formats are allowed:
- callback()
- callback(err)
- callback(null, exitCode);

The exit code can be any integer number starting from 10. Some reserved exit codes are not used, but you may have problems if we use. The reserved exit codes are:
- **0** = Loop task ends.
- **1** = Unknown exit code. If you not specified an exit code, the framework will put this one. And the loop continues.
- **2** = Negative delay. When the delay to next task execution is negative. The task is not executed and the loop continues.
- **3** = Not used.
- **4** = Not used.
- **5** = Not used.
- **6** = Not used.
- **7** = Not used.
- **8** = Not used.
- **9** = Not used.

## License
[MIT](http://opensource.org/licenses/MIT)
