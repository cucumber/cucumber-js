var Exception = {
  registerUncaughtExceptionHandler: function registerUncaughtExceptionHandler(exceptionHandler) {
    if (process.domain)
      process.domain.on('error', exceptionHandler);
    else if (process.on)
      process.on('uncaughtException', exceptionHandler);
    else if (typeof(window) != 'undefined')
      window.onerror = exceptionHandler;
  },

  unregisterUncaughtExceptionHandler: function unregisterUncaughtExceptionHandler(exceptionHandler) {
    if (process.domain)
      process.domain.removeListener('error', exceptionHandler);
    else if (process.removeListener)
      process.removeListener('uncaughtException', exceptionHandler);
    else if (typeof(window) != 'undefined')
     window.onerror = void(0);
  }
};

module.exports = Exception;
