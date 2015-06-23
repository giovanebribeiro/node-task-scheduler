var TaskScheduler = require('./TaskScheduler.js');

var init = function(options){
  if(!options){
    throw new Error("Options object must be set!");  
  }

  if(!options.tasksDir){
    throw new Error("options.tasksDir must be set!");
  }

  var ts = new TaskScheduler(options.tasksDir);
  return ts;
};

module.exports.init = init;
