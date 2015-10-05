function StatsJournal(options) {
  var Cucumber = require('../../cucumber');
  var _ = require('underscore');

  function getCountsObject () {
    var obj = {};
    Cucumber.Status.ALL.forEach(function(status) {
      obj[status] = 0;
    });
    return obj;
  }

  var currentScenarioStatus;
  var scenarioCounts = getCountsObject();
  var stepCounts = getCountsObject();

  if (!options)
    options = {};

  var self = Cucumber.Listener();

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    currentScenarioStatus = Cucumber.Status.PASSED;
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    scenarioCounts[currentScenarioStatus] += 1;
    callback();
  };

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var status = stepResult.getStatus();
    var step = stepResult.getStep();

    if (!step.isHidden()) {
      stepCounts[status] += 1;
    }

    if (self.shouldSetCurrentScenarioStatus(status)) {
      currentScenarioStatus = status;
    }

    callback();
  };

  self.shouldSetCurrentScenarioStatus = function shouldSetCurrentScenarioStatus(status) {
    switch (status) {
      case Cucumber.Status.FAILED:
        return true;
      case Cucumber.Status.PENDING:
      case Cucumber.Status.SKIPPED:
        return currentScenarioStatus === Cucumber.Status.PASSED;
      case Cucumber.Status.UNDEFINED:
        return currentScenarioStatus !== Cucumber.Status.FAILED;
      default:
        return false;
    }
  };

  self.isCurrentScenarioFailing = function isCurrentScenarioFailing() {
    return currentScenarioStatus === Cucumber.Status.FAILED;
  };

  self.getScenarioCounts = function getScenarioCounts() {
    return _.clone(scenarioCounts);
  };

  self.getStepCounts = function getStepCounts() {
    return _.clone(stepCounts);
  };

  return self;
}

module.exports = StatsJournal;
