if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([], function() {
var Exception = {
  registerUncaughtExceptionHandler: function registerUncaughtExceptionHandler(exceptionHandler) {
    if (typeof process !== 'undefined' && process.on)
      process.on('uncaughtException', exceptionHandler);
    else
      window.onerror = exceptionHandler;
  },

  unregisterUncaughtExceptionHandler: function unregisterUncaughtExceptionHandler(exceptionHandler) {
    if (typeof process !== 'undefined' && process.removeListener)
      process.removeListener('uncaughtException', exceptionHandler);
    else
     window.onerror = void(0);
  }
};

return Exception;
});
