/* jshint -W117 */
var Debug = require('../debug');

var Exception = {
  registerUncaughtExceptionHandler: function registerUncaughtExceptionHandler(exceptionHandler, domain) {
    if (domain && domain.enter) {
      Debug.notice('entering domain ' + domain.id + '\n', 'Cucumber.Util.Exception', 5);
      domain.on('error', exceptionHandler);
    } else if (process.on) {
      process.on('uncaughtException', exceptionHandler);
    } else if (typeof(window) !== 'undefined') {
      window.onerror = exceptionHandler;
    }
  },

  unregisterUncaughtExceptionHandler: function unregisterUncaughtExceptionHandler(exceptionHandler, domain) {
    if (domain && domain.exit) {
      Debug.notice('exiting domain ' + domain.id + '\n', 'Cucumber.Util.Exception', 5);
      domain.removeListener('error', exceptionHandler);
    } else if (process.removeListener) {
      process.removeListener('uncaughtException', exceptionHandler);
    } else if (typeof(window) !== 'undefined') {
     window.onerror = void(0);
    }
  }
};

module.exports = Exception;
