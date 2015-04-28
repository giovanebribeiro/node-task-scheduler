/*
 * Unit of execution of this framework
 *
 * Parameters (passed by process.args)
 * delay to execute
 * task name
 */

(function(){
'use strict';

var TaskData = require('./TaskData.js');
var debug = require('debug')('lib/Task.js');

var _delay = process.argv[2];
var _taskName = process.argv[3];
debug('Task name: '+_taskName);

TaskData.toTaskData(_taskName,function(taskData){
  setTimeout(function(){
    taskData.activity();
  }, _delay);
});


})();
