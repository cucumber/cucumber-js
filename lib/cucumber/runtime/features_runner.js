function FeaturesRunner(features, supportCodeLibrary, listeners, options) {
  var Cucumber = require('../../cucumber');

  var allListeners = listeners.concat(supportCodeLibrary.getListeners());
  var eventBroadcaster = Cucumber.Runtime.EventBroadcaster(allListeners);
  var featuresResult = Cucumber.Runtime.FeaturesResult(options.strict);

  var self = {
    run: function run(callback) {
      var payload = { features: features };
      var event   = Cucumber.Runtime.Event(Cucumber.Events.FEATURES_EVENT_NAME, payload);
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
      var payload = { featuresResult: featuresResult };
      var event   = Cucumber.Runtime.Event(Cucumber.Events.FEATURES_RESULT_EVENT_NAME, payload);
      eventBroadcaster.broadcastEvent(event, callback);
    },

    runFeature: function runFeature(feature, callback) {
      if (!featuresResult.isSuccessful() && options.failFast) {
        return callback();
      }
      var payload = { feature: feature };
      var event   = Cucumber.Runtime.Event(Cucumber.Events.FEATURE_EVENT_NAME, payload);
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
