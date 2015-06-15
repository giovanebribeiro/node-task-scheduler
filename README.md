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
scheduler.addTask('hello', {msg: "Hello World!"}, function(args, callback){
  console.log(args.msg);
  callback();
}, "0 * * * * *", endDate);

...

//removing the task
scheduler.removeTask('hello');
```

## Wiki
Yes, we have a wiki! Click [here](https://github.com/giovanebribeiro/node-task-scheduler/wiki) for details.

## License
[MIT](http://opensource.org/licenses/MIT)
