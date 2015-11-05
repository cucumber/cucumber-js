function StatsJournal(options) {
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

  var scenarioResult;
  var scenarioCounts = getCountsObject();
  var stepCounts = getCountsObject();
  var duration = 0;

  if (!options)
    options = {};

  var self = Cucumber.Listener();

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    scenarioResult = Cucumber.Runtime.ScenarioResult();
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    scenarioCounts[scenarioResult.getStatus()] += 1;
    callback();
  };

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var stepDuration = stepResult.getDuration();
    if (stepDuration) {
      duration += stepDuration;
    }

    var status = stepResult.getStatus();
    var step = stepResult.getStep();

    if (!step.isHidden()) {
      stepCounts[status] += 1;
    }

    scenarioResult.witnessStepResult(stepResult);

    callback();
  };

  self.isCurrentScenarioFailing = function isCurrentScenarioFailing() {
    return scenarioResult.getStatus() === Cucumber.Status.FAILED;
  };

  self.getScenarioCounts = function getScenarioCounts() {
    return _.clone(scenarioCounts);
  };

  self.getStepCounts = function getStepCounts() {
    return _.clone(stepCounts);
  };

  self.getDuration = function getDuration() {
    return duration;
  };

  return self;
}

module.exports = StatsJournal;
