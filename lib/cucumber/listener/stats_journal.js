function StatsJournal(options) {
  var Cucumber = require('../../cucumber');
  var _ = require('underscore');

  function getCountsObject () {
    return {
      failed: 0,
      passed: 0,
      pending: 0,
      skipped: 0,
      undefined: 0
    };
  }

  var currentScenarioStatus;
  var scenarioCounts = getCountsObject();
  var stepCounts = getCountsObject();

  if (!options)
    options = {};

  var self = Cucumber.Listener();

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    currentScenarioStatus = 'passed';
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    scenarioCounts[currentScenarioStatus] += 1;
    callback();
  };

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    if (stepResult.isSuccessful())
      self.handleSuccessfulStepResult(step);
    else if (stepResult.isPending())
      self.handlePendingStepResult();
    else if (stepResult.isUndefined())
      self.handleUndefinedStepResult();
    else if (stepResult.isSkipped())
      self.handleSkippedStepResult();
    else
      self.handleFailedStepResult();
    callback();
  };

  self.handleSuccessfulStepResult = function handleSuccessfulStepResult(step) {
    if (!step.isHidden())
      stepCounts.passed += 1;
  };

  self.handlePendingStepResult = function handlePendingStepResult() {
    stepCounts.pending += 1;
    if (currentScenarioStatus === 'passed') {
      currentScenarioStatus = 'pending';
    }
  };

  self.handleSkippedStepResult = function handleSkippedStepResult() {
    stepCounts.skipped += 1;
    if (currentScenarioStatus === 'passed') {
      currentScenarioStatus = 'skipped';
    }
  };

  self.handleUndefinedStepResult = function handleUndefinedStepResult() {
    stepCounts.undefined += 1;
    if (currentScenarioStatus !== 'failed') {
      currentScenarioStatus = 'undefined';
    }
  };

  self.handleFailedStepResult = function handleFailedStepResult() {
    stepCounts.failed += 1;
    currentScenarioStatus = 'failed';
  };

  self.isCurrentScenarioFailing = function isCurrentScenarioFailing() {
    return currentScenarioStatus === 'failed';
  };

  self.getScenarioCounts = function getScenarioCounts() {
    return _.clone(scenarioCounts);
  };

  self.getStepCounts = function getStepCounts() {
    return _.clone(stepCounts);
  };

  self.witnessedAnyFailedStep = function witnessedAnyFailedStep() {
    return stepCounts.failed > 0;
  };

  self.witnessedAnyUndefinedStep = function witnessedAnyUndefinedStep() {
    return stepCounts.undefined > 0;
  };

  return self;
}

module.exports = StatsJournal;
