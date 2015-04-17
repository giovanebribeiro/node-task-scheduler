var fs = require('fs');
var mkdirp = require('mkdirp');
var _path = require('path');
var debug = require('debug')('util/file.js');

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

  read: function(path, cb){
    debug("Reading file: ", path);
    fs.readFile(path, 'utf-8', function(err, data){
      if(err){
        debug("f.read - err thrown.");
      }
      debug("File", path,"read.");
      return cb(err, data);
    });
  },

  write: function(path, str, cb){
    fs.writeFile(path, str, {overwrite: true}, function(err){
      return cb(err);
    });
  },

  rm: function(path){
    if(fs.existsSync(path)){
      if(fs.lstatSync(path).isFile()){
        fs.unlinkSync(path);
      }else{
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
    }
  },

  exists: function(path){
    return fs.existsSync(path);
  },

  readDir: function(path, cb){
    fs.readdir(path, function(err,files){
      return cb(err, files);
    });
  }
};
