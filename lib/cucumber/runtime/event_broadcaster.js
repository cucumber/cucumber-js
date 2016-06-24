function EventBroadcaster(listeners, listenerDefaultTimeout) {
  var Cucumber = require('../../cucumber');

  var self = {
    broadcastAroundEvent: function broadcastAroundEvent(event, userFunction, callback) {
      self.broadcastBeforeEvent(event, function() {
        userFunction(function() {
          var userFunctionCallbackArguments = arguments;
          self.broadcastAfterEvent(event, function() {
            callback.apply(null, userFunctionCallbackArguments);
          });
        });
      });
    },

    broadcastBeforeEvent: function broadcastBeforeEvent(event, callback) {
      var preEvent = event.replicateAsPreEvent();
      self.broadcastEvent(preEvent, callback);
    },

    broadcastAfterEvent: function broadcastAfterEvent(event, callback) {
      var postEvent = event.replicateAsPostEvent();
      self.broadcastEvent(postEvent, callback);
    },

    broadcastEvent: function broadcastEvent(event, callback) {
      Cucumber.Util.asyncForEach(listeners, function (listener, callback) {
        listener.hear(event, listenerDefaultTimeout, function(error) {
          if (error) {
            throw error;
          }
          callback();
        });
      }, callback);
    }
  };

  return self;
}

module.exports = EventBroadcaster;
