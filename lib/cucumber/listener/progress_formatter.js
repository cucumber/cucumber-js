function ProgressFormatter(options) {
  var Cucumber = require('../../cucumber');
  if (!options)
    options = {};

  var colors = Cucumber.Util.Colors(options.useColors);
  var characters = {
    failed: colors.failed('F'),
    passed: colors.passed('.'),
    pending: colors.pending('P'),
    skipped: colors.skipped('-'),
    undefined: colors.undefined('U')
  };

  var self             = Cucumber.Listener.Formatter(options);
  var summaryFormatter = Cucumber.Listener.SummaryFormatter({
    coffeeScriptSnippets: options.coffeeScriptSnippets,
    snippets: options.snippets,
    useColors: options.useColors
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
    self.log(characters.passed);
  };

  self.handlePendingStepResult = function handlePendingStepResult() {
    self.log(characters.pending);
  };

  self.handleSkippedStepResult = function handleSkippedStepResult() {
    self.log(characters.skipped);
  };

  self.handleUndefinedStepResult = function handleUndefinedStepResult() {
    self.log(characters.undefined);
  };

  self.handleFailedStepResult = function handleFailedStepResult() {
    self.log(characters.failed);
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    var summaryLogs = summaryFormatter.getLogs();
    self.log('\n\n');
    self.log(summaryLogs);
    self.finish(callback);
  };

  return self;
}

module.exports = ProgressFormatter;
