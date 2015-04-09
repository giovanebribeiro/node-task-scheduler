var fs = require('fs');
var mkdirp = require('mkdirp');
var _path = require('path');
var debug = require('debug')('util:file.js');

var fileUtils;
module.exports = fileUtils = {
  mkdir: function(path, fn){
    mkdirp(path, 0755, function(err){
      if(err) throw err;

      debug('*** create d: ' + path);

      if(fn){
        fn();
      }
    });
  },

  read: function(path){
    return fs.readFileSync(path, 'utf-8');
  },

  write: function(path, str, mode){
    fs.writeFileSync(path, str, {mode: mode || 0666});
  },

  rm: function(path){
    if(fs.existsSync(path)){
      fs.readdirSync(path).forEach(function(file,index){
        var curPath = _path.join(path, file);
        if(fs.lstatSync(curPath).isDirectory()){
          fileUtils.rm(curPath);
        }else{
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  },

  exists: function(path){
    return fs.existsSync(path);
  }
};
