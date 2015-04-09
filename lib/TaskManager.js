/*
 * File: management.js
 * Author: Giovane Boaviagem
 * 
 * Functions to manage tasks (create, update and remove)
 */
var fs = require('fs');
var mkdirp = require('mkdirp');
var cronParser = require('cron-parser');
var debug = require('debug')('TaskManager');

var TaskManager;

// Constructor
module.exports = TaskManager = function(){};

/*
 * Create (or update) a task, saving the data in a json-file, stored in lib/tasks folder.
 *
 * Parameters:
 * - name: Task name. Must be unique, and will be the task json file name
 * - freq: Cron-string with the frequency of the task executions. Check this link (https://github.com/harrisiirak/cron-parser) for details.
 * - activity: Function to be executed.
 * - endDate (optional): Limit date to execute the task.
 */
TaskManager.prototype.createOrUpdate = function(name, freq, activity, endDate){

  // 
  // checking parameters
  //

  // < 3, error!
  if(arguments.length < 3){
    throw new Error('Invalid arguments');
  }else{
   
    if(typeof name != "string"){
      throw new Error("The task name must be a string");
    }

    if(typeof freq != "string"){
      throw new Error("The task frequency must be a string");
    }

    if(typeof activity != "function"){
      throw new Error("The task activity must be a function");
    }

    if(endDate && !(endDate instanceof Date)){
      throw new Error("The final task date must be a Date object");
    }
  
  }

  name = this.taskDir+"/"+name+".json";

  // create the json-file
  var stats = fs.lstatSync(name);
  if(stats.isFile()){
    
  }

  // Generating the cron dates
  var interval = cronParser.parseExpression(freq);

  // mounting the file
  var json = {
    cron: interval,
    task: activity.toString()    
  };

  if(endDate){
    json.endDate = endDate;
  }

  // saving the file
  fs.writeFileSync(name, JSON.stringify(json, null, 2), {mode: 0666});
  debug('Task added successfully');
};
