if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './listener/formatter',
  './listener/pretty_formatter',
  './listener/progress_formatter',
  './listener/stats_journal',
  './listener/summarizer'
], function(Formatter, PrettyFormatter, ProgressFormatter, StatsJournal, Summarizer) {

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

Listener.Formatter         = Formatter;
Listener.PrettyFormatter   = PrettyFormatter;
Listener.ProgressFormatter = ProgressFormatter;
Listener.StatsJournal      = StatsJournal;
Listener.Summarizer        = Summarizer;
return Listener;
});
