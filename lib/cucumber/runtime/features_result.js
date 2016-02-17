function FeaturesResult(strict) {
  var Cucumber = require('../../cucumber');
  var _ = require('lodash');

  function getCountsObject () {
    var statuses = [
      Cucumber.Status.AMBIGUOUS,
      Cucumber.Status.FAILED,
      Cucumber.Status.PASSED,
      Cucumber.Status.PENDING,
      Cucumber.Status.SKIPPED,
      Cucumber.Status.UNDEFINED
    ];
    var counts = {};
    statuses.forEach(function (status) {
      counts[status] = 0;
    });
    return counts;
  }

  var duration = 0;
  var scenarioCounts = getCountsObject();
  var stepCounts = getCountsObject();

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
      scenarioCounts[scenarioResult.getStatus()] += 1;
    },

    witnessStepResult: function witnessStepResult(stepResult) {
      var stepDuration = stepResult.getDuration();
      if (stepDuration) {
        duration += stepDuration;
      }

      var status = stepResult.getStatus();
      var step = stepResult.getStep();

      if (!step.isHidden()) {
        stepCounts[status] += 1;
      }
    }
  };

  return self;
}

module.exports = FeaturesResult;
