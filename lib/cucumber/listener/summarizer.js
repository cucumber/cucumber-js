var Summarizer = function (options) {
  var Cucumber = require('../../cucumber');

  var logs                    = "";
  var failedScenarioLogBuffer = "";
  var undefinedStepLogBuffer  = "";
  var failedStepResults       = Cucumber.Type.Collection();
  var statsJournal            = Cucumber.Listener.StatsJournal();
  var Formatter               = Cucumber.Listener.Formatter;

  var self = Cucumber.Listener();

  var parentHear = self.hear;

  var addStyleToText = function addStyleToText(text, color) {
    var ansi_color;
    if (options && options.colors) {
      ansi_color = require('ansi-color');
      return ansi_color.set(text, color);
    }
    return text;
  };

  self.hear = function hear(event, callback) {
    statsJournal.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.log = function log(string) {
    logs += string;
  };

  self.getLogs = function getLogs() {
    return logs;
  };

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    if (stepResult.isUndefined()) {
      self.handleUndefinedStepResult(stepResult);
    } else if (stepResult.isFailed()) {
      self.handleFailedStepResult(stepResult);
    }
    callback();
  };

  self.handleUndefinedStepResult = function handleUndefinedStepResult(stepResult) {
    var step = stepResult.getStep();
    self.storeUndefinedStep(step);
  };

  self.handleFailedStepResult = function handleFailedStepResult(stepResult) {
    self.storeFailedStepResult(stepResult);
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    if (statsJournal.isCurrentScenarioFailing()) {
      var scenario = event.getPayloadItem('scenario');
      self.storeFailedScenario(scenario);
    }
    callback();
  };

  self.handleAfterFeaturesEvent = function handleAfterFeaturesEvent(event, callback) {
    self.logSummary();
    callback();
  };

  self.storeFailedStepResult = function storeFailedStepResult(failedStepResult) {
    failedStepResults.add(failedStepResult);
  };

  self.storeFailedScenario = function storeFailedScenario(failedScenario) {
    var name = failedScenario.getName();
    var uri  = failedScenario.getUri();
    var line = failedScenario.getLine();
    self.appendStringToFailedScenarioLogBuffer(uri + ":" + line + " # Scenario: " + name);
  };

  self.storeUndefinedStep = function storeUndefinedStep(step) {
    var snippetBuilder = Cucumber.SupportCode.StepDefinitionSnippetBuilder(step);
    var snippet        = snippetBuilder.buildSnippet();
    self.appendStringToUndefinedStepLogBuffer(snippet);
  };

  self.appendStringToFailedScenarioLogBuffer = function appendStringToFailedScenarioLogBuffer(string) {
    failedScenarioLogBuffer += string + "\n";
  };

  self.appendStringToUndefinedStepLogBuffer = function appendStringToUndefinedStepLogBuffer(string) {
    if (undefinedStepLogBuffer.indexOf(string) == -1)
      undefinedStepLogBuffer += string + "\n";
  };

  self.getFailedScenarioLogBuffer = function getFailedScenarioLogBuffer() {
    return failedScenarioLogBuffer;
  };

  self.getUndefinedStepLogBuffer = function getUndefinedStepLogBuffer() {
    return undefinedStepLogBuffer;
  };

  self.logSummary = function logSummary() {
    self.log("\n\n");
    if (statsJournal.witnessedAnyFailedStep())
      self.logFailedStepResults();
    self.logScenariosSummary();
    self.logStepsSummary();
    if (statsJournal.witnessedAnyUndefinedStep())
      self.logUndefinedStepSnippets();
  };

  self.logFailedStepResults = function logFailedStepResults() {
    var banner = "(::) failed steps (::)";
    self.log(banner + "\n\n");
    failedStepResults.syncForEach(function(stepResult) {
      self.logFailedStepResult(stepResult);
    });
    self.log("Failing scenarios:\n");
    var failedScenarios = self.getFailedScenarioLogBuffer();
    self.log(failedScenarios);
    self.log("\n");
  };

  self.logFailedStepResult = function logFailedStepResult(stepResult) {
    var failureMessage = stepResult.getFailureException();
    self.log(failureMessage.stack || failureMessage);
    self.log("\n\n");
  };

  function logSummaryHelper(noun) {
    var suffix         = " " + noun.toLowerCase();
    var count          = statsJournal["get"+noun+"Count"]();
    var passedCount    = statsJournal["getPassed"+noun+"Count"]();
    var undefinedCount = statsJournal["getUndefined"+noun+"Count"]();
    var pendingCount   = statsJournal["getPending"+noun+"Count"]();
    var failedCount    = statsJournal["getFailed"+noun+"Count"]();
    var skippedCount   = 0;
    var details        = [];

    if (statsJournal["getSkipped"+noun+"Count"])
      skippedCount = statsJournal["getSkipped"+noun+"Count"]();

    self.log(count + suffix + (count != 1 ? "s" : ""));
    if (count > 0 ) {
      if (failedCount > 0)
        details.push(addStyleToText(failedCount + " failed", Formatter.FAILED_COLOR));
      if (undefinedCount > 0)
        details.push(addStyleToText(undefinedCount + " undefined", Formatter.UNDEFINED_COLOR));
      if (pendingCount > 0)
        details.push(addStyleToText(pendingCount + " pending", Formatter.PENDING_COLOR));
      if (skippedCount > 0)
        details.push(addStyleToText(skippedCount   + " skipped", Formatter.SKIPPED_COLOR));
      if (passedCount > 0)
        details.push(addStyleToText(passedCount + " passed", Formatter.SUCCESSFUL_COLOR));
      self.log(" (" + details.join(', ') + ")");
    }
    self.log("\n");
  }

  self.logScenariosSummary = function logScenariosSummary() {
    logSummaryHelper("Scenario");
  };

  self.logStepsSummary = function logStepsSummary() {
    logSummaryHelper("Step");
  };

  self.logUndefinedStepSnippets = function logUndefinedStepSnippets() {
    var undefinedStepLogBuffer = self.getUndefinedStepLogBuffer();
    self.log("\nYou can implement step definitions for undefined steps with these snippets:\n\n");
    self.log(undefinedStepLogBuffer);
  };

  return self;
};
module.exports = Summarizer;
