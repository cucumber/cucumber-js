var ConsoleColor = require('../util/colors');
var ProgressFormatter = function(options) {
  var Cucumber = require('../../cucumber');
  if (!options)
    options = {};

  var self             = Cucumber.Listener.Formatter(options);
  var summaryFormatter = Cucumber.Listener.SummaryFormatter({
    coffeeScriptSnippets: options.coffeeScriptSnippets,
    logToConsole: false
  });

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    summaryFormatter.hear(event, function () {
      parentHear(event, callback);
    });
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
      self.handleUndefinedStepResult();
    else
      self.handleFailedStepResult();
    callback();
  };

  self.handleSuccessfulStepResult = function handleSuccessfulStepResult() {
    self.log(ProgressFormatter.PASSED_STEP_CHARACTER);
  };

  self.handlePendingStepResult = function handlePendingStepResult() {
    self.log(ProgressFormatter.PENDING_STEP_CHARACTER);
  };

  self.handleSkippedStepResult = function handleSkippedStepResult() {
    self.log(ProgressFormatter.SKIPPED_STEP_CHARACTER);
  };

  self.handleUndefinedStepResult = function handleUndefinedStepResult() {
    self.log(ProgressFormatter.UNDEFINED_STEP_CHARACTER);
  };

  self.handleFailedStepResult = function handleFailedStepResult() {
    self.log(ProgressFormatter.FAILED_STEP_CHARACTER);
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var summaryLogs = summaryFormatter.getLogs();
    self.log("\n\n");
    self.log(summaryLogs);
    callback();
  };

  return self;
};
ProgressFormatter.PASSED_STEP_CHARACTER    = ConsoleColor.format('passed', '.');
ProgressFormatter.SKIPPED_STEP_CHARACTER   = ConsoleColor.format('skipped', '-');
ProgressFormatter.UNDEFINED_STEP_CHARACTER = ConsoleColor.format('undefined', 'U');
ProgressFormatter.PENDING_STEP_CHARACTER   = ConsoleColor.format('pending', 'P');
ProgressFormatter.FAILED_STEP_CHARACTER    = ConsoleColor.format('failed', 'F');
module.exports                             = ProgressFormatter;
