/* jshint -W117 */

var Exception = {
  registerUncaughtExceptionHandler: function registerUncaughtExceptionHandler(exceptionHandler) {
    if (typeof(window) !== 'undefined') {
      window.onerror = exceptionHandler;
    } else {
      process.on('uncaughtException', exceptionHandler);
    }
  },

  unregisterUncaughtExceptionHandler: function unregisterUncaughtExceptionHandler(exceptionHandler) {
    if (typeof(window) !== 'undefined') {
      window.onerror = void(0);
    } else {
      process.removeListener('uncaughtException', exceptionHandler);
    }
  }
};

module.exports = Exception;
