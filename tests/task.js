var chai = require('chai');
var assert = chai.assert;
var util = require('util');
var path = require('path');
var TaskData = require('../lib/TaskData.js');
var forever = require('forever-monitor');

suite('Task tests', function(){
  var tomorrow;
  var taskMaster;
  var delay;

  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    //taskMaster = new TestMaster();
    delay = 3;
  });

  test('- if task is executed in correct time.', function(done){
    // set timeout to delay
    this.timeout(delay*1000*2);
    // create the task
    var helloTask1 = new TaskData('hello', function(){
      console.log("Hello World! from hello");
    }, '* * * * *', tomorrow);

    // convert to file
    helloTask1.toFile(function(err){
      if(err) throw err;

      var delayTest = delay*1000;

      var child = new (forever.Monitor)(path.join(__dirname,'..',path.sep,'lib',path.sep,'Task.js'),{
        max:1,
        silent: true,
        args: [delayTest, 'hello']
      });
      child.on('stdout', function(m){
        // this event catches all console.log, for example.
        console.log(m.toString('utf-8'));
        done();
      });
      child.start();

    });
  });
});
