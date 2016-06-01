function FeaturesResult(strict) {
  var Cucumber = require('../../cucumber');
  var _ = require('lodash');

  var duration = 0;
  var scenarioCounts = Cucumber.Status.getMapping(0);
  var stepCounts = Cucumber.Status.getMapping(0);

  var self = {
    getDuration: function getDuration() {
      return duration;
    },

    getScenarioCounts: function getScenarioCounts() {
      return _.clone(scenarioCounts);
    },

    getStepCounts: function getStepCounts() {
      return _.clone(stepCounts);
    },

    isSuccessful: function isSuccessful() {
      if (scenarioCounts[Cucumber.Status.FAILED] > 0 || scenarioCounts[Cucumber.Status.AMBIGUOUS] > 0) {
        return false;
      }
      if (strict && (scenarioCounts[Cucumber.Status.PENDING] > 0 || scenarioCounts[Cucumber.Status.UNDEFINED] > 0)) {
        return false;
      }
      return true;
    },

    witnessScenarioResult: function witnessScenarioResult(scenarioResult) {
      duration += scenarioResult.getDuration();
      scenarioCounts[scenarioResult.getStatus()] += 1;
      _.mergeWith(stepCounts, scenarioResult.getStepCounts(), function(a, b) { return a + b; });
    }
  };

  return self;
}

module.exports = FeaturesResult;
