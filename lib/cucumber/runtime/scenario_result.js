function ScenarioResult(scenario) {
  var Cucumber = require('../../cucumber');
  var _ = require('lodash');

  var duration = 0;
  var status = Cucumber.Status.PASSED;
  var stepCounts = Cucumber.Status.getMapping(0);
  var failureException = null;

  var shouldUpdateStatus = function shouldUpdateStatus(stepStatus) {
    switch (stepStatus) {
      case Cucumber.Status.FAILED:
        return true;
      case Cucumber.Status.AMBIGUOUS:
      case Cucumber.Status.PENDING:
      case Cucumber.Status.SKIPPED:
      case Cucumber.Status.UNDEFINED:
        return status === Cucumber.Status.PASSED;
      default:
        return false;
    }
  };

  var self = {
    getDuration: function getDuration() {
      return duration;
    },

    getFailureException: function getFailureException() {
      return failureException;
    },

    getScenario: function getScenario() {
      return scenario;
    },

    getStepCounts: function getStepCounts() {
      return _.clone(stepCounts);
    },

    getStatus: function getStatus() {
      return status;
    },

    witnessStepResult: function witnessStepResult(stepResult) {
      var stepDuration = stepResult.getDuration();
      if (stepDuration) {
        duration += stepDuration;
      }
      var stepStatus = stepResult.getStatus();
      if (shouldUpdateStatus(stepStatus)) {
        status = stepStatus;
      }
      if (stepStatus === Cucumber.Status.FAILED) {
        failureException = stepResult.getFailureException();
      }
      var step = stepResult.getStep();
      if (!step.isHidden()) {
        stepCounts[stepStatus] += 1;
      }
    }
  };

  return self;
}

module.exports = ScenarioResult;
