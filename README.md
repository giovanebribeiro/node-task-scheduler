## DEPRECIATED!!

This project was an incredible lab for me and I learned many things. However, the node.js changed a lot and I don't have time at the moment to upgrade it. So, I decided to archive this repo. To everyone that (still!) uses this lib, I recommend the amazing project [agenda](https://www.npmjs.com/package/agenda)

Thank you for all support. See ya!



# node-task-scheduler [![Build Status](https://travis-ci.org/giovanebribeiro/node-task-scheduler.svg?branch=master)](https://travis-ci.org/giovanebribeiro/node-task-scheduler) [![npm version](https://badge.fury.io/js/node-task-scheduler.svg)](http://badge.fury.io/js/node-task-scheduler) [![Coverage Status](https://coveralls.io/repos/giovanebribeiro/node-task-scheduler/badge.svg?branch=master&service=github)](https://coveralls.io/github/giovanebribeiro/node-task-scheduler?branch=master)

A Task scheduler for node.js, with cron-syntax, specific execution intervals and due dates.

## Instalation
```bash
npm install --save node-task-scheduler
```

## Example usage
```javascript
var nts=require('node-task-scheduler');

var scheduler = nts.init({
  // add some parameters! Check wiki for details
});

global.scheduler = scheduler; //available to entire application

//starting previous tasks
ts.start(function(taskNames){
  console.log("Previous tasks loaded:");
  taskNames.forEach(function(taskName){
    console.log(taskName);
  });
});

...

//adding task, to be executed each minute, until endDate
scheduler.addTask('hello', {hello: 'world'}, function(args, callback){
  console.log("Hello from hello! ", "ARGS: "+args.hello);
  callback();
}, "0 * * * * *", endDate);

...

//removing the task
scheduler.removeTask('hello', function(){
  console.log("Task 'hello' removed.");
});
```

## Wiki
Yes, we have a wiki! Click [here](https://github.com/giovanebribeiro/node-task-scheduler/wiki) for details.

## License
[MIT](http://opensource.org/licenses/MIT)
