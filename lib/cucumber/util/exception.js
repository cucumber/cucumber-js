var Exception = {
  registerUncaughtExceptionHandler: function registerUncaughtExceptionHandler(exceptionHandler, domain) {
    if (domain && domain.enter) {
      domain.on('error', exceptionHandler);
      domain.enter();
    } else if (process.on) {
      process.on('uncaughtException', exceptionHandler);
    } else if (typeof(window) != 'undefined') {
      window.onerror = exceptionHandler;
    }
  },

  unregisterUncaughtExceptionHandler: function unregisterUncaughtExceptionHandler(exceptionHandler, domain) {
    if (domain && domain.exit) {
      domain.removeListener('error', exceptionHandler);
      domain.exit();
    } else if (process.removeListener) {
      process.removeListener('uncaughtException', exceptionHandler);
    } else if (typeof(window) != 'undefined') {
     window.onerror = void(0);
    }
  }
};

module.exports = Exception;
