var chai = require('chai');
var assert = chai.assert;

var TaskRunner = require('../lib/TaskRunner.js');
var TaskData = require('../lib/TaskData.js');

suite('TaskRunner tests', function(){
  var tomorrow;
  var runner;

  setup(function(){
    tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    runner = new TaskRunner();
  });

  test('- after 1sec, execute the task', function(done){
    var helloTask1 = new TaskData('helloTask1', function(){
      console.log("Hello World!");
      assert.ok(1);
    }, '* * * * *', tomorrow);

    helloTask1.toFile(function(err){
      if(err) throw err;

      runner.start();
      runner.on('event', function(type, pid, e){
        if(type == 'child message'){
          // do stuff
          done();
        }
      });

    });

  });

});
