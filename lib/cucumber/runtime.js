function Runtime(configuration) {
  var Cucumber = require('../cucumber');

  var listeners = [];

  var self = {
    start: function start(callback) {
      if (typeof(callback) !== 'function')
        throw new Error(Runtime.START_MISSING_CALLBACK_ERROR);

      var features = self.getFeatures();
      var supportCodeLibrary = self.getSupportCodeLibrary();
      var options = {
        dryRun: configuration.isDryRunRequested && configuration.isDryRunRequested(),
        failFast: configuration.isFailFastRequested && configuration.isFailFastRequested(),
        strict: configuration.isStrictRequested && configuration.isStrictRequested()
      };

      var featuresRunner = Runtime.FeaturesRunner(features, supportCodeLibrary, listeners, options);

      if (configuration.shouldFilterStackTraces())
        Runtime.StackTraceFilter.filter();

      featuresRunner.run(function (result) {
        Runtime.StackTraceFilter.unfilter();
        callback(result);
      });
    },

    attachListener: function attachListener(listener) {
      listeners.push(listener);
    },

    getFeatures: function getFeatures() {
      var featureSources = configuration.getFeatureSources();
      var astFilter      = configuration.getAstFilter();
      var parser         = Cucumber.Parser(featureSources, astFilter);
      var features       = parser.parse();
      return features;
    },

    getSupportCodeLibrary: function getSupportCodeLibrary() {
      var supportCodeLibrary = configuration.getSupportCodeLibrary();
      return supportCodeLibrary;
    }
  };
  return self;
}

Runtime.START_MISSING_CALLBACK_ERROR = 'Cucumber.Runtime.start() expects a callback';
Runtime.Attachment                   = require('./runtime/attachment');
Runtime.Event                        = require('./runtime/event');
Runtime.EventBroadcaster             = require('./runtime/event_broadcaster');
Runtime.FeaturesResult               = require('./runtime/features_result');
Runtime.FeaturesRunner               = require('./runtime/features_runner');
Runtime.ScenarioResult               = require('./runtime/scenario_result');
Runtime.ScenarioRunner               = require('./runtime/scenario_runner');
Runtime.StackTraceFilter             = require('./runtime/stack_trace_filter');
Runtime.StepResult                   = require('./runtime/step_result');

module.exports = Runtime;
