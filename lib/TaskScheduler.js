/*
 * Main File
 */

var TaskManager = require('./TaskManager.js');
var TaskRunner = require('./TaskRunner.js');

var TaskScheduler = function(){
  this.manager = new TaskManager();
  this.runner = new TaskRunner(this.manager);

 
};

module.exports = new TaskScheduler();
