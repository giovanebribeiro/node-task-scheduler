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
