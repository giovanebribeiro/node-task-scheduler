/*
 * File: string.js
 * Author: Giovane Boaviagem
 *
 * Extends String class functions
 */

if(typeof String.prototype.endsWith !== "function"){
  String.prototype.endsWith = function(suffix){
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}

if(typeof String.prototype.getExt !== "function"){
  String.prototype.getExt = function(){
    return this.substr(this.lastIndexOf('.')+1);
  };
}

if(typeof String.prototype.removeExt !== "function"){
  String.prototype.removeExt = function(){
    return this.substr(0, this.lastIndexOf('.'));
  };
}
