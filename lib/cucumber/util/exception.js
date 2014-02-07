var Exception = {
    registerUncaughtExceptionHandler: function registerUncaughtExceptionHandler(exceptionHandler) {
        'use strict';
        if (process.on) {
            process.on('uncaughtException', exceptionHandler);
        } else if (typeof (window) !== 'undefined') {
            window.onerror = exceptionHandler;
        }
    },

    unregisterUncaughtExceptionHandler: function unregisterUncaughtExceptionHandler(exceptionHandler) {
        'use strict';
        if (process.removeListener) {
            process.removeListener('uncaughtException', exceptionHandler);
        } else if (typeof (window) !== 'undefined') {
            window.onerror = void(0);
        }
    }
};

module.exports = Exception;