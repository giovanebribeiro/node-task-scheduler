(function(){
"use strict";

module.exports = {
  /**
   * Reserved exit codes:
   */
  exit_codes:{
    loop_ends: 0,         /* Normal execution. Loop ends. */
    unknown_exit_code: 1,  /* Unknown exit code. Loop continues. */
    negative_delay: 2  /* Negative delay. */
  }
};

})();
