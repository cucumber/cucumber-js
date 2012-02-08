var ProgressFormatter = function(options) {
  var Cucumber = require('../../cucumber');

  var logs                     = "";
  var failedScenarioLogBuffer  = "";
  var undefinedStepLogBuffer   = "";
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
  var failedStepResults        = Cucumber.Type.Collection();

  if (!options)
    options = {};
  if (options['logToConsole'] == undefined)
    options['logToConsole'] = true;
  var self = {
    log: function log(string) {
      logs += string;
      if (options['logToConsole'])
        process.stdout.write(string);
      if (typeof(options['logToFunction']) == 'function')
        options['logToFunction'](string);
    },

    getLogs: function getLogs() {
      return logs;
    },

    hear: function hear(event, callback) {
      if (self.hasHandlerForEvent(event)) {
        var handler = self.getHandlerForEvent(event);
        handler(event, callback);
      } else {
        callback();
      }
    },

    hasHandlerForEvent: function hasHandlerForEvent(event) {
      var handlerName = self.buildHandlerNameForEvent(event);
      return self[handlerName] != undefined;
    },

    buildHandlerNameForEvent: function buildHandlerNameForEvent(event) {
      var handlerName =
        ProgressFormatter.EVENT_HANDLER_NAME_PREFIX +
        event.getName() +
        ProgressFormatter.EVENT_HANDLER_NAME_SUFFIX;
      return handlerName;
    },

    getHandlerForEvent: function getHandlerForEvent(event) {
      var eventHandlerName = self.buildHandlerNameForEvent(event);
      return self[eventHandlerName];
    },

    handleBeforeScenarioEvent: function handleBeforeScenarioEvent(event, callback) {
      self.prepareBeforeScenario();
      callback();
    },

    handleStepResultEvent: function handleStepResult(event, callback) {
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
    },

    handleSuccessfulStepResult: function handleSuccessfulStepResult() {
      self.witnessPassedStep();
      self.log(ProgressFormatter.PASSED_STEP_CHARACTER);
    },

    handlePendingStepResult: function handlePendingStepResult() {
      self.witnessPendingStep();
      self.markCurrentScenarioAsPending();
      self.log(ProgressFormatter.PENDING_STEP_CHARACTER);
    },

    handleSkippedStepResult: function handleSkippedStepResult() {
      self.witnessSkippedStep();
      self.log(ProgressFormatter.SKIPPED_STEP_CHARACTER);
    },

    handleUndefinedStepResult: function handleUndefinedStepResult(stepResult) {
      var step = stepResult.getStep();
      self.storeUndefinedStep(step);
      self.witnessUndefinedStep();
      self.markCurrentScenarioAsUndefined();
      self.log(ProgressFormatter.UNDEFINED_STEP_CHARACTER);
    },

    handleFailedStepResult: function handleFailedStepResult(stepResult) {
      self.storeFailedStepResult(stepResult);
      self.witnessFailedStep();
      self.markCurrentScenarioAsFailing();
      self.log(ProgressFormatter.FAILED_STEP_CHARACTER);
    },

    handleAfterFeaturesEvent: function handleAfterFeaturesEvent(event, callback) {
      self.logSummary();
      callback();
    },

    handleAfterScenarioEvent: function handleAfterScenarioEvent(event, callback) {
      if (self.isCurrentScenarioFailing()) {
        var scenario = event.getPayloadItem('scenario');
        self.storeFailedScenario(scenario);
        self.witnessFailedScenario();
      } else if (self.isCurrentScenarioUndefined()) {
        self.witnessUndefinedScenario();
      } else if (self.isCurrentScenarioPending()) {
        self.witnessPendingScenario();
      } else {
        self.witnessPassedScenario();
      }
      callback();
    },

    prepareBeforeScenario: function prepareBeforeScenario() {
      currentScenarioFailing   = false;
      currentScenarioPending   = false;
      currentScenarioUndefined = false;
    },

    markCurrentScenarioAsFailing: function markCurrentScenarioAsFailing() {
      currentScenarioFailing = true;
    },

    markCurrentScenarioAsUndefined: function markCurrentScenarioAsUndefined() {
      currentScenarioUndefined = true;
    },

    markCurrentScenarioAsPending: function markCurrentScenarioAsPending() {
      currentScenarioPending = true;
    },

    isCurrentScenarioFailing: function isCurrentScenarioFailing() {
      return currentScenarioFailing;
    },

    isCurrentScenarioUndefined: function isCurrentScenarioUndefined() {
      return currentScenarioUndefined;
    },

    isCurrentScenarioPending: function isCurrentScenarioPending() {
      return currentScenarioPending;
    },

    storeFailedStepResult: function storeFailedStepResult(failedStepResult) {
      failedStepResults.add(failedStepResult);
    },

    storeFailedScenario: function storeFailedScenario(failedScenario) {
      var name = failedScenario.getName();
      var line = failedScenario.getLine();
      self.appendStringToFailedScenarioLogBuffer(":" + line + " # Scenario: " + name);
    },

    storeUndefinedStep: function storeUndefinedStep(step) {
      var snippetBuilder = Cucumber.SupportCode.StepDefinitionSnippetBuilder(step);
      var snippet        = snippetBuilder.buildSnippet();
      self.appendStringToUndefinedStepLogBuffer(snippet);
    },

    appendStringToFailedScenarioLogBuffer: function appendStringToFailedScenarioLogBuffer(string) {
      failedScenarioLogBuffer += string + "\n";
    },

    appendStringToUndefinedStepLogBuffer: function appendStringToUndefinedStepLogBuffer(string) {
      if (undefinedStepLogBuffer.indexOf(string) == -1)
        undefinedStepLogBuffer += string + "\n";
    },

    getFailedScenarioLogBuffer: function getFailedScenarioLogBuffer() {
      return failedScenarioLogBuffer;
    },

    getUndefinedStepLogBuffer: function getUndefinedStepLogBuffer() {
      return undefinedStepLogBuffer;
    },

    logSummary: function logSummary() {
      self.log("\n\n");
      if (self.witnessedAnyFailedStep())
        self.logFailedStepResults();
      self.logScenariosSummary();
      self.logStepsSummary();
      if (self.witnessedAnyUndefinedStep())
        self.logUndefinedStepSnippets();
    },

    logFailedStepResults: function logFailedStepResults() {
      self.log("(::) failed steps (::)\n\n");
      failedStepResults.syncForEach(function(stepResult) {
        self.logFailedStepResult(stepResult);
      });
      self.log("Failing scenarios:\n");
      var failedScenarios = self.getFailedScenarioLogBuffer();
      self.log(failedScenarios);
      self.log("\n");
    },

    logFailedStepResult: function logFailedStepResult(stepResult) {
      var failureMessage = stepResult.getFailureException();
      self.log(failureMessage.stack || failureMessage);
      self.log("\n\n");
    },

    logScenariosSummary: function logScenariosSummary() {
      var scenarioCount          = self.getScenarioCount();
      var passedScenarioCount    = self.getPassedScenarioCount();
      var undefinedScenarioCount = self.getUndefinedScenarioCount();
      var pendingScenarioCount   = self.getPendingScenarioCount();
      var failedScenarioCount    = self.getFailedScenarioCount();
      var details                = [];

      self.log(scenarioCount + " scenario" + (scenarioCount != 1 ? "s" : ""));
      if (scenarioCount > 0 ) {
        if (failedScenarioCount > 0)
          details.push(failedScenarioCount + " failed");
        if (undefinedScenarioCount > 0)
          details.push(undefinedScenarioCount + " undefined");
        if (pendingScenarioCount > 0)
          details.push(pendingScenarioCount + " pending");
        if (passedScenarioCount > 0)
          details.push(passedScenarioCount + " passed");
        self.log(" (" + details.join(', ') + ")");
      }
      self.log("\n");
    },

    logStepsSummary: function logStepsSummary() {
      var stepCount          = self.getStepCount();
      var passedStepCount    = self.getPassedStepCount();
      var undefinedStepCount = self.getUndefinedStepCount();
      var skippedStepCount   = self.getSkippedStepCount();
      var pendingStepCount   = self.getPendingStepCount();
      var failedStepCount    = self.getFailedStepCount();
      var details            = [];

      self.log(stepCount + " step" + (stepCount != 1 ? "s" : ""));
      if (stepCount > 0) {
        if (failedStepCount > 0)
          details.push(failedStepCount    + " failed");
        if (undefinedStepCount > 0)
          details.push(undefinedStepCount + " undefined");
        if (pendingStepCount > 0)
          details.push(pendingStepCount   + " pending");
        if (skippedStepCount > 0)
          details.push(skippedStepCount   + " skipped");
        if (passedStepCount > 0)
          details.push(passedStepCount    + " passed");
        self.log(" (" + details.join(', ') + ")");
      }
      self.log("\n");
    },

    logUndefinedStepSnippets: function logUndefinedStepSnippets() {
      var undefinedStepLogBuffer = self.getUndefinedStepLogBuffer();
      self.log("\nYou can implement step definitions for undefined steps with these snippets:\n\n");
      self.log(undefinedStepLogBuffer);
    },

    witnessPassedScenario: function witnessPassedScenario() {
      passedScenarioCount++;
    },

    witnessUndefinedScenario: function witnessUndefinedScenario() {
      undefinedScenarioCount++;
    },

    witnessPendingScenario: function witnessPendingScenario() {
      pendingScenarioCount++;
    },

    witnessFailedScenario: function witnessFailedScenario() {
      failedScenarioCount++;
    },

    witnessPassedStep: function witnessPassedStep() {
      passedStepCount++;
    },

    witnessUndefinedStep: function witnessUndefinedStep() {
      undefinedStepCount++;
    },

    witnessPendingStep: function witnessPendingStep() {
      pendingStepCount++;
    },

    witnessFailedStep: function witnessFailedStep() {
      failedStepCount++;
    },

    witnessSkippedStep: function witnessSkippedStep() {
      skippedStepCount++;
    },

    getScenarioCount: function getScenarioCount() {
      var scenarioCount =
        self.getPassedScenarioCount()    +
        self.getUndefinedScenarioCount() +
        self.getPendingScenarioCount()   +
        self.getFailedScenarioCount();
      return scenarioCount;
    },

    getPassedScenarioCount: function getPassedScenarioCount() {
      return passedScenarioCount;
    },

    getUndefinedScenarioCount: function getUndefinedScenarioCount() {
      return undefinedScenarioCount;
    },

    getPendingScenarioCount: function getPendingScenarioCount() {
      return pendingScenarioCount;
    },

    getFailedScenarioCount: function getFailedScenarioCount() {
      return failedScenarioCount;
    },

    getStepCount: function getStepCount() {
      var stepCount =
        self.getPassedStepCount()    +
        self.getUndefinedStepCount() +
        self.getSkippedStepCount()   +
        self.getPendingStepCount()   +
        self.getFailedStepCount();
      return stepCount;
    },

    getPassedStepCount: function getPassedStepCount() {
      return passedStepCount;
    },

    getPendingStepCount: function getPendingStepCount() {
      return pendingStepCount;
    },

    getFailedStepCount: function getFailedStepCount() {
      return failedStepCount;
    },

    getSkippedStepCount: function getSkippedStepCount() {
      return skippedStepCount;
    },

    getUndefinedStepCount: function getUndefinedStepCount() {
      return undefinedStepCount;
    },

    witnessedAnyFailedStep: function witnessedAnyFailedStep() {
      return failedStepCount > 0;
    },

    witnessedAnyUndefinedStep: function witnessedAnyUndefinedStep() {
      return undefinedStepCount > 0;
    }
  };
  return self;
};
ProgressFormatter.PASSED_STEP_CHARACTER     = '.';
ProgressFormatter.SKIPPED_STEP_CHARACTER    = '-';
ProgressFormatter.UNDEFINED_STEP_CHARACTER  = 'U';
ProgressFormatter.PENDING_STEP_CHARACTER    = 'P';
ProgressFormatter.FAILED_STEP_CHARACTER     = 'F';
ProgressFormatter.EVENT_HANDLER_NAME_PREFIX = 'handle';
ProgressFormatter.EVENT_HANDLER_NAME_SUFFIX = 'Event';
module.exports                              = ProgressFormatter;
