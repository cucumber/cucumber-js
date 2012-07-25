var Listener = function () {
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
      return self[handlerName] != undefined;
    },

    buildHandlerNameForEvent: function buildHandlerNameForEvent(event) {
      var handlerName =
        Listener.EVENT_HANDLER_NAME_PREFIX +
        event.getName() +
        Listener.EVENT_HANDLER_NAME_SUFFIX;
      return handlerName;
    },

    getHandlerForEvent: function getHandlerForEvent(event) {
      var eventHandlerName = self.buildHandlerNameForEvent(event);
      return self[eventHandlerName];
    }
  };
  return self;
};

Listener.EVENT_HANDLER_NAME_PREFIX = 'handle';
Listener.EVENT_HANDLER_NAME_SUFFIX = 'Event';

Listener.Formatter         = require('./listener/formatter');
Listener.PrettyFormatter   = require('./listener/pretty_formatter');
Listener.ProgressFormatter = require('./listener/progress_formatter');
Listener.JsonFormatter     = require('./listener/json_formatter');
Listener.StatsJournal      = require('./listener/stats_journal');
Listener.SummaryFormatter  = require('./listener/summary_formatter');
module.exports             = Listener;
