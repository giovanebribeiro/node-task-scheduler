var logger = require('./logger.js');
require('./date.js');

var Task;

// convertendo as datas em String para Date.
var datesToExecute = process.argv[2].split(',');
for(var a=0; a<datesToExecute.length; a++){
  datesToExecute[a] = new Date(datesToExecute[a]);
}

var filename = process.argv[3];

var delayInterval = 60*1000; // 1 min
var pid = process.pid;

var hello = function(){
  console.log("Hello World!");
}

module.exports = Task = function(){};

Task.prototype.start = function(){
  setInterval(this.execute.bind(this), this.delayInterval);
  this.sendMessage();
};

// Executa a task, mas somente se estiver na data correta
Task.prototype.execute = function(){
  var now = new Date();

  for(var i=0; i < datesToExecute.length; i++){
    var dateToExecute = datesToExecute[i];

    if(dateToExecute.getTime() == now.getTime()){
      // se as datas baterem, execute a task
      //require(filename)();
      hello();
      this.sendMessage();
      break;
    }
  }
};

// Send a message to master when task is finished.
Task.prototype.sendMessage = function(){
  var now = new Date();
  var uptime = process.uptime();
  var message = now.toString()+" - Task "+filename+"["+pid+"] executed with upset "+uptime+"ms.";
  process.send({
    custom: message
  }); 
};

var t = new Task();
t.start();

process.on('disconnect', function(){
  process.kill();
});
