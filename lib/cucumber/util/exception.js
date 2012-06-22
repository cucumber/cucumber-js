var Exception = {
  registerUncaughtExceptionHandler: function registerUncaughtExceptionHandler(exceptionHandler) {
    if (process.on)
      process.on('uncaughtException', exceptionHandler);
    else
      window.onerror = exceptionHandler;
  },

  unregisterUncaughtExceptionHandler: function unregisterUncaughtExceptionHandler(exceptionHandler) {
    if (process.removeListener)
      process.removeListener('uncaughtException', exceptionHandler);
    else
     window.onerror = void(0);
  }
};

module.exports = Exception;
