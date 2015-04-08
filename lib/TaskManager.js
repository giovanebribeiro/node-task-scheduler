/*
 * File: management.js
 * Author: Giovane Boaviagem
 * 
 * Functions to manage tasks (create, update and remove)
 */
var fs = require('fs');
var mkdirp = require('mkdirp');
var cronParser = require('cron-parser');

var TaskManager;

// Constructor
module.exports = TaskManager = function(){
  this.taskDir = __dirname + '/tasks';

  mkdirp(this.taskDir, 0755, function(err){
    if(err) throw err;

    debug("TaskManager() - Created dir: "+this.taskDir);
  });
};

// Create a task
TaskManager.prototype.create = function(name, freq, endDate, activity){
  // procedimentos:
  // - criar o json
  // - checar se já existe task com esse nome
  // - gravar o arquivo (ver como o arquivo file.js do sagui grava os files)  
};
