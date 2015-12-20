function ScenarioResult(scenario) {
  var Cucumber = require('../../cucumber');

  var status = Cucumber.Status.PASSED;
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
    getFailureException: function getFailureException() {
      return failureException;
    },

    getScenario: function getScenario() {
      return scenario;
    },

    getStatus: function getStatus() {
      return status;
    },

    witnessStepResult: function witnessStepResult(stepResult) {
      var stepStatus = stepResult.getStatus();
      self.witnessStepStatus(stepStatus);
      if (stepStatus === Cucumber.Status.FAILED) {
        failureException = stepResult.getFailureException();
      }
    },

    witnessStepStatus: function witnessStepWithStatis(stepStatus) {
      if (shouldUpdateStatus(stepStatus)) {
        status = stepStatus;
      }
    }
  };

  return self;
}

module.exports = ScenarioResult;
