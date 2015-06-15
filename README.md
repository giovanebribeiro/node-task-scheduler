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
scheduler.addTask('hello', {hello: 'world'}, function(args, callback){
  console.log("Hello from hello! ", "ARGS: "+args.hello);
  callback();
}, "0 * * * * *", endDate);

...

//removing the task
scheduler.removeTask('hello');
```

## Wiki
Yes, we have a wiki! Click [here](https://github.com/giovanebribeiro/node-task-scheduler/wiki) for details.

## API
| Function   | Description                                                                | Parameters (in order)                                                                                                            |
|------------|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| addTask    | Add (or update) a task to scheduler                                        | Task name. If the name is already assigned to other task, this task will be updated with these data.                             |
|			 |		| Task arguments. The task must have a json with some arguments to input. If your task not have arguments, your object will be empty. |
|            |                                                                            | Function to be executed. The function have 2 params: the arguments object, and the callback function.                                                         |
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
The callback function can have 2 parameters:
- The error object, and
- The exit code

But, the parameters are not required. So, the following callback formats are allowed:
- callback()
- callback(err)
- callback(null, exitCode);

The exit code can be any integer number, but the range from 90 to 99 are reserved. Some reserved exit codes are not used, but you may have problems if you use. The reserved exit codes are:

- **90** = Loop task ends.
- **91** = Unknown exit code. If you not specified an exit code, the framework will put this one. And the loop continues.
- **92** = Negative delay. When the delay to next task execution is negative. The task is not executed and the loop continues.
- **93** = Not used.
- **94** = Not used.
- **95** = Not used.
- **96** = Not used.
- **97** = Not used.
- **98** = Not used.
- **99** = Not used.

**Important:** Be careful when use low exit codes. It may conflict with node process exit codes. Check [here](https://nodejs.org/api/process.html#process_exit_codes) for details.
>>>>>>> 876fb79809f1086d0385be4ce0b2f1034a16aec6

## License
[MIT](http://opensource.org/licenses/MIT)
