var path = require('path');

function Listener(options) {
  var Cucumber     = require('../cucumber');

  if (!options) {
    options = {};
  }

  var self = {
    hear: function hear(event, defaultTimeout, callback) {
      if (self.hasHandlerForEvent(event)) {
        var handler = self.getHandlerForEvent(event);
        var timeout = self.getTimeout() || defaultTimeout;
        Cucumber.Util.run(handler, null, [event.getPayload()], timeout, function(error) {
          error = self.prependLocationToError(error);
          callback(error);
        });
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
    },

    getTimeout: function() {
      return options.timeout;
    },

    getUri: function() {
      return options.uri;
    },

    getLine: function() {
      return options.line;
    },

    prependLocationToError: function(error) {
      if (error && self.getUri()) {
        var ref = path.relative(process.cwd(), self.getUri()) + ':' + self.getLine() + ' ';
        if (error instanceof Error) {
          error.message = ref + error.message;
        } else {
          error = ref + error;
        }
      }
      return error;
    },
  };
  return self;
}

Listener.EVENT_HANDLER_NAME_PREFIX = 'handle';
Listener.EVENT_HANDLER_NAME_SUFFIX = 'Event';
Listener.Formatter                 = require('./listener/formatter');
Listener.PrettyFormatter           = require('./listener/pretty_formatter');
Listener.ProgressFormatter         = require('./listener/progress_formatter');
Listener.JsonFormatter             = require('./listener/json_formatter');
Listener.RerunFormatter            = require('./listener/rerun_formatter');
Listener.SummaryFormatter          = require('./listener/summary_formatter');

module.exports             = Listener;
