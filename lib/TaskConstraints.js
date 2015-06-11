/**
 * @file lib/TaskConstraints.js - List of system constraints
 * @author Giovane Boaviagem
 * @version 1.1.0
 */
(function(){
"use strict";

module.exports = {
  /**
   * Reserved exit codes:
   */
  exit_codes:{
    loop_ends: 90,         /* Normal execution. Loop ends. */
    unknown_exit_code: 91,  /* Unknown exit code. Loop continues. */
    negative_delay: 92  /* Negative delay. */
  }
};

})();
