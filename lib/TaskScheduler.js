/*
 * Main File
 */

var TaskData = require('./TaskData.js');
var TaskManager = require('./TaskManager.js');
var TaskRunner = require('./TaskRunner.js');

var TaskScheduler = function(){
  this.manager = new TaskManager();
  //this.runner = new TaskRunner();
};

module.exports = new TaskScheduler();
