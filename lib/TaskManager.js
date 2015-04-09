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
module.exports = TaskManager = function(){
  this.taskDir = __dirname + '/tasks';

  mkdirp(this.taskDir, 0755, function(err){
    if(err) throw err;

    debug("Created tasks dir");
  });
};

/*
 *
 */
TaskManager.prototype.getTasksDir = function(){
  return this.taskDir;
};

/*
 *  
 */
TaskManager.prototype.create = function(name, freq, activity, endDate){
    
  //
  // check parameters
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
    throw new Error("A task with same name already exists");
  }

  // Generating the cron dates
  var interval = cronParser.parseExpression(freq);

  // mounting the file
  var json = {
    cron: interval,
    task: activity    
  };

  if(endDate){
    json.endDate = endDate;
  }

  // saving the file
  fs.writeFileSync(name, JSON.stringify(json, null, 2), {mode: 0666});
  debug('Task added successfully');
};
