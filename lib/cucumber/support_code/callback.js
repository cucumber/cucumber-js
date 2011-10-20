var Callback = function(code) {
  var Cucumber = require('../../cucumber');

  var self = {
    invoke: function(world, callback) {
      try {
        code.apply(world, [callback]);
      } catch(exception) {
        if (exception)
          Cucumber.Debug.warn(exception.stack || exception, 'exception inside before callback', 3);

        callback();
      }
    }
  };
  return self;
};
module.exports = Callback;
