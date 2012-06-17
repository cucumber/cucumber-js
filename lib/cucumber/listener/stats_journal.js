var StatsJournal = function(options) {
  var Cucumber = require('../../cucumber');

  var passedScenarioCount      = 0;
  var undefinedScenarioCount   = 0;
  var pendingScenarioCount     = 0;
  var failedScenarioCount      = 0;
  var passedStepCount          = 0;
  var failedStepCount          = 0;
  var skippedStepCount         = 0;
  var undefinedStepCount       = 0;
  var pendingStepCount         = 0;
  var currentScenarioFailing   = false;
  var currentScenarioUndefined = false;
  var currentScenarioPending   = false;

  if (!options)
    options = {};

  var self = Cucumber.Listener();

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    self.prepareBeforeScenario();
    callback();
  };

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    if (stepResult.isSuccessful())
      self.handleSuccessfulStepResult();
    else if (stepResult.isPending())
      self.handlePendingStepResult();
    else if (stepResult.isSkipped())
      self.handleSkippedStepResult();
    else if (stepResult.isUndefined())
      self.handleUndefinedStepResult(stepResult);
    else
      self.handleFailedStepResult(stepResult);
    callback();
  };

  self.handleSuccessfulStepResult = function handleSuccessfulStepResult() {
    self.witnessPassedStep();
  };

  self.handlePendingStepResult = function handlePendingStepResult() {
    self.witnessPendingStep();
    self.markCurrentScenarioAsPending();
  };

  self.handleSkippedStepResult = function handleSkippedStepResult() {
    self.witnessSkippedStep();
  };

  self.handleUndefinedStepResult = function handleUndefinedStepResult(stepResult) {
    var step = stepResult.getStep();
    self.witnessUndefinedStep();
    self.markCurrentScenarioAsUndefined();
  };

  self.handleFailedStepResult = function handleFailedStepResult(stepResult) {
    self.witnessFailedStep();
    self.markCurrentScenarioAsFailing();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    if (self.isCurrentScenarioFailing()) {
      var scenario = event.getPayloadItem('scenario');
      self.witnessFailedScenario();
    } else if (self.isCurrentScenarioUndefined()) {
      self.witnessUndefinedScenario();
    } else if (self.isCurrentScenarioPending()) {
      self.witnessPendingScenario();
    } else {
      self.witnessPassedScenario();
    }
    callback();
  };

  self.prepareBeforeScenario = function prepareBeforeScenario() {
    currentScenarioFailing   = false;
    currentScenarioPending   = false;
    currentScenarioUndefined = false;
  };

  self.markCurrentScenarioAsFailing = function markCurrentScenarioAsFailing() {
    currentScenarioFailing = true;
  };

  self.markCurrentScenarioAsUndefined = function markCurrentScenarioAsUndefined() {
    currentScenarioUndefined = true;
  };

  self.markCurrentScenarioAsPending = function markCurrentScenarioAsPending() {
    currentScenarioPending = true;
  };

  self.isCurrentScenarioFailing = function isCurrentScenarioFailing() {
    return currentScenarioFailing;
  };

  self.isCurrentScenarioUndefined = function isCurrentScenarioUndefined() {
    return currentScenarioUndefined;
  };

  self.isCurrentScenarioPending = function isCurrentScenarioPending() {
    return currentScenarioPending;
  };

  self.witnessPassedScenario = function witnessPassedScenario() {
    passedScenarioCount++;
  };

  self.witnessUndefinedScenario = function witnessUndefinedScenario() {
    undefinedScenarioCount++;
  };

  self.witnessPendingScenario = function witnessPendingScenario() {
    pendingScenarioCount++;
  };

  self.witnessFailedScenario = function witnessFailedScenario() {
    failedScenarioCount++;
  };

  self.witnessPassedStep = function witnessPassedStep() {
    passedStepCount++;
  };

  self.witnessUndefinedStep = function witnessUndefinedStep() {
    undefinedStepCount++;
  };

  self.witnessPendingStep = function witnessPendingStep() {
    pendingStepCount++;
  };

  self.witnessFailedStep = function witnessFailedStep() {
    failedStepCount++;
  };

  self.witnessSkippedStep = function witnessSkippedStep() {
    skippedStepCount++;
  };

  self.getScenarioCount = function getScenarioCount() {
    var scenarioCount =
      self.getPassedScenarioCount()    +
      self.getUndefinedScenarioCount() +
      self.getPendingScenarioCount()   +
      self.getFailedScenarioCount();
    return scenarioCount;
  };

  self.getPassedScenarioCount = function getPassedScenarioCount() {
    return passedScenarioCount;
  };

  self.getUndefinedScenarioCount = function getUndefinedScenarioCount() {
    return undefinedScenarioCount;
  };

  self.getPendingScenarioCount = function getPendingScenarioCount() {
    return pendingScenarioCount;
  };

  self.getFailedScenarioCount = function getFailedScenarioCount() {
    return failedScenarioCount;
  };

  self.getStepCount = function getStepCount() {
    var stepCount =
      self.getPassedStepCount()    +
      self.getUndefinedStepCount() +
      self.getSkippedStepCount()   +
      self.getPendingStepCount()   +
      self.getFailedStepCount();
    return stepCount;
  };

  self.getPassedStepCount = function getPassedStepCount() {
    return passedStepCount;
  };

  self.getPendingStepCount = function getPendingStepCount() {
    return pendingStepCount;
  };

  self.getFailedStepCount = function getFailedStepCount() {
    return failedStepCount;
  };

  self.getSkippedStepCount = function getSkippedStepCount() {
    return skippedStepCount;
  };

  self.getUndefinedStepCount = function getUndefinedStepCount() {
    return undefinedStepCount;
  };

  self.witnessedAnyFailedStep = function witnessedAnyFailedStep() {
    return failedStepCount > 0;
  };

  self.witnessedAnyUndefinedStep = function witnessedAnyUndefinedStep() {
    return undefinedStepCount > 0;
  };

  return self;
};
StatsJournal.EVENT_HANDLER_NAME_PREFIX = 'handle';
StatsJournal.EVENT_HANDLER_NAME_SUFFIX = 'Event';
module.exports = StatsJournal;
