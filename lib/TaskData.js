var mongoose = require('mongoose');
var logger = require('../lib/logger');
var cronParser = require('cron-parser');
require('../lib/date.js');
var fs=require('fs');
var collectionName = 'Task';

var schema = mongoose.Schema({
  filename: {type: String, index: {unique: true, dropDups: true}},
  datesToExecute: [Date]
});

schema.statics.collectionExists = function(callback){
  database.getAllCollections(function(err, collections){
    if(err) throw err;

    callback(_.contains(collections, collectionName));
  });
};

schema.statics.add = function(taskFilename, freq, endDatetime, callback){
    
   var taskFile = __base + 'crontab/' + taskFilename;

   if(!fs.lstatSync(taskFile).isFile()){
     throw new Error("Task file not exists or not present in crontab folder.");
   }

   var parsedDates = cronParser.parseExpression(freq);
   var datesToExecute = [];
   do{
     var dateToExecute = parsedDates.next();
     datesToExecute.push(dateToExecute);
     if(dateToExecute.compare(endDatetime)){
       break;
     }
   }while(true);

   var task = new Task();
   task.filename = taskFile;
   task.datesToExecute = datesToExecute;

   task.save(function(err){
     callback(err, task);
   });

   /*
   logger.silly(cronRecord[taskFilename].task);
   logger.silly(cronRecords[taskFilename].dates);
   logger.silly(cronRecords[taskFilename].endDate.toString());
   */
 }; // add task

schema.statics.del = function(taskname){
  throw new Error("Not Implemented yet.");
};


var Task = mongoose.model('Task', schema);
module.exports = Task;
