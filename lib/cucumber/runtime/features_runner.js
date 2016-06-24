function FeaturesRunner(features, supportCodeLibrary, listeners, options) {
  var Cucumber = require('../../cucumber');

  var allListeners = listeners.concat(supportCodeLibrary.getListeners());
  var eventBroadcaster = Cucumber.Runtime.EventBroadcaster(allListeners, supportCodeLibrary.getDefaultTimeout());
  var featuresResult = Cucumber.Runtime.FeaturesResult(options.strict);

  var self = {
    run: function run(callback) {
      var event = Cucumber.Runtime.Event(Cucumber.Events.FEATURES_EVENT_NAME, features);
      eventBroadcaster.broadcastAroundEvent(
        event,
        function (callback) {
          Cucumber.Util.asyncForEach(features, self.runFeature, function() {
            self.broadcastFeaturesResult(callback);
          });
        },
        function() {
          callback(featuresResult.isSuccessful());
        }
      );
    },

    broadcastFeaturesResult: function visitFeaturesResult(callback) {
      var event = Cucumber.Runtime.Event(Cucumber.Events.FEATURES_RESULT_EVENT_NAME, featuresResult);
      eventBroadcaster.broadcastEvent(event, callback);
    },

    runFeature: function runFeature(feature, callback) {
      if (!featuresResult.isSuccessful() && options.failFast) {
        return callback();
      }
      var event = Cucumber.Runtime.Event(Cucumber.Events.FEATURE_EVENT_NAME, feature);
      eventBroadcaster.broadcastAroundEvent(
        event,
        function (callback) {
          Cucumber.Util.asyncForEach(feature.getScenarios(), self.runScenario, callback);
        },
        callback
      );
    },

    runScenario: function runScenario(scenario, callback) {
      if (!featuresResult.isSuccessful() && options.failFast) {
        return callback();
      }

      var scenarioRunner = Cucumber.Runtime.ScenarioRunner(scenario, supportCodeLibrary, eventBroadcaster, options);
      scenarioRunner.run(function(scenarioResult) {
        featuresResult.witnessScenarioResult(scenarioResult);
        callback();
      });
    }
  };
  return self;
}

module.exports = FeaturesRunner;
