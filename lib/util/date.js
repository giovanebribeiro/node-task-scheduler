var debug = require('debug')('util/date.js');

// 
// Extending the Date class
//
Date.prototype.compare = function(b){
  // comparing full year
  if(this.getFullYear() != b.getFullYear()){
    return false;
  }else{
    
    // comparing month
    if(this.getMonth() != b.getMonth()){
      return false;
    }else{
    
      // comparing day of month
      if(this.getDate() != b.getDate()){
        return false;
      }else{
        
        // comparing day of week
        if(this.getDay() != b.getDay()){
          return false;
        }else{
          
          // comparing hours
          if(this.getHours() != b.getHours()){
            return false;
          }else{
            
            // comparing minutes
            if(this.getMinutes() != b.getMinutes()){
              return false;
            }else{
              
              // comparing seconds
              if(this.getSeconds() != b.getSeconds()){
                return false;
              }else{
                return true;
              }
            }
          }
        }
      }
    }
  }
};

