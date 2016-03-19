function Listener() {
  var self = {
    hear: function hear(event, callback) {
      if (self.hasHandlerForEvent(event)) {
        var handler = self.getHandlerForEvent(event);
        handler(event, callback);
      } else {
        callback();
      }
    },

    hasHandlerForEvent: function hasHandlerForEvent(event) {
      var handlerName = self.buildHandlerNameForEvent(event);
      return self[handlerName] !== undefined;
    },

    buildHandlerNameForEvent: function buildHandlerNameForEvent(event) {
      return self.buildHandlerName(event.getName());
    },

    getHandlerForEvent: function getHandlerForEvent(event) {
      var eventHandlerName = self.buildHandlerNameForEvent(event);
      return self[eventHandlerName];
    },

    buildHandlerName: function buildHandler(shortName) {
      return Listener.EVENT_HANDLER_NAME_PREFIX + shortName + Listener.EVENT_HANDLER_NAME_SUFFIX;
    },

    setHandlerForEvent: function setHandlerForEvent(shortname, handler) {
      var eventName = self.buildHandlerName(shortname);
      self[eventName] = handler;
    }
  };
  return self;
}

Listener.EVENT_HANDLER_NAME_PREFIX = 'handle';
Listener.EVENT_HANDLER_NAME_SUFFIX = 'Event';
Listener.Events                    = require('./listener/events');
Listener.Formatter                 = require('./listener/formatter');
Listener.PrettyFormatter           = require('./listener/pretty_formatter');
Listener.ProgressFormatter         = require('./listener/progress_formatter');
Listener.JsonFormatter             = require('./listener/json_formatter');
Listener.RerunFormatter            = require('./listener/rerun_formatter');
Listener.SummaryFormatter          = require('./listener/summary_formatter');

module.exports             = Listener;
