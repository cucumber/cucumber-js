if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    '../type/collection',
    '../support_code/step_definition_snippet_builder',
    'ansi-color'
], function(Collection, StepDefinitionSnippetBuilder, AnsiColor) {
var PrettyFormatter = function(options) {
  var setColor = AnsiColor.set;

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
  var failedStepResults        = Collection();

  options = options || {};
  if (options.logToConsole === undefined) {
    options.logToConsole = true;
  }

  var self = {
    log: function log(string) {
      logs += string;
      if (options.logToConsole) {
        if (string[string.length-1] === "\n") {
          // console.log alredy adds a newline char
          string = string.slice(0, string.length-1); // chomp
        }
        console.log(string);
      }

      if (typeof(options.logToFunction) == 'function') {
        options.logToFunction(string);
      }
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
        PrettyFormatter.EVENT_HANDLER_NAME_PREFIX +
        event.getName() +
        PrettyFormatter.EVENT_HANDLER_NAME_SUFFIX;
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
      var step = event.getPayloadItem('step');
      step.setResult(stepResult);
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
    },

    handlePendingStepResult: function handlePendingStepResult() {
      self.witnessPendingStep();
      self.markCurrentScenarioAsPending();
    },

    handleSkippedStepResult: function handleSkippedStepResult() {
      self.witnessSkippedStep();
    },

    handleUndefinedStepResult: function handleUndefinedStepResult(stepResult) {
      var step = stepResult.getStep();
      self.storeUndefinedStep(step);
      self.witnessUndefinedStep();
      self.markCurrentScenarioAsUndefined();
    },

    handleFailedStepResult: function handleFailedStepResult(stepResult) {
      self.storeFailedStepResult(stepResult);
      self.witnessFailedStep();
      self.markCurrentScenarioAsFailing();
    },

    handleAfterFeaturesEvent: function handleAfterFeaturesEvent(event, callback) {
      self.logSummary();
      callback();
    },

    handleAfterFeatureEvent: function handleAfterFeatureEvent(event, callback) {
      var feature = event.getPayloadItem('feature');
      self.logFeature(feature);
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
      var snippetBuilder = StepDefinitionSnippetBuilder(step);
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

    logFeature: function logFeature(feature) {
      var description = feature.getDescription().split("\n").map(function(l) { return "  "+l; }).join("\n");
      self.log(feature.getKeyword()+": "+feature.getName()+"\n");
      self.log(description+"\n\n");
      if (feature.hasBackground()) {
        self.log(feature.getBackground().split("\n").map(function(l) { return "  "+l; }).join("\n")+"\n\n");
      }
      self.logScenarios(feature.getScenarios());
    },

    logScenarios: function logScenarios(scenarios) {
      scenarios.syncForEach(function(scenario) {
        self.log("  "+scenario.getKeyword()+": "+scenario.getName()+"\n");
        self.logSteps(scenario.getSteps());
      });
    },

    logSteps: function logSteps(steps) {
      steps.syncForEach(function(step) {
          var color, result = step.getResult();
          if (result.isFailed()) {
            color = PrettyFormatter.FAILED_STEP_COLOR;
          } else if (result.isPending()) {
            color = PrettyFormatter.PENDING_STEP_COLOR;
          } else if (result.isSkipped()) {
            color = PrettyFormatter.SKIPPED_STEP_COLOR;
          } else if (result.isSuccessful()) {
            color = PrettyFormatter.PASSED_STEP_COLOR;
          } else if (result.isUndefined()) {
            color = PrettyFormatter.UNDEFINED_STEP_COLOR;
          }
          self.log(setColor("    "+step.getKeyword()+step.getName(), color)+"\n");
          if (result.isFailed()) {
            self.logFailedStepResult(result);
          }
        });
    },

    logSummary: function logSummary() {
      self.log("\n");
      self.logScenariosSummary();
      self.logStepsSummary();
      if (self.witnessedAnyUndefinedStep() && options["logSnippets"])
        self.logUndefinedStepSnippets();
    },

    logFailedStepResult: function logFailedStepResult(stepResult) {
      var failureMessage = stepResult.getFailureException();
      self.log(setColor(failureMessage.stack || failureMessage, "red"));
    },

    logScenariosSummary: function logScenariosSummary() {
      var scenarioCount          = self.getScenarioCount();
      var passedScenarioCount    = self.getPassedScenarioCount();
      var undefinedScenarioCount = self.getUndefinedScenarioCount();
      var pendingScenarioCount   = self.getPendingScenarioCount();
      var failedScenarioCount    = self.getFailedScenarioCount();
      var details                = [];
      var summary;

      summary = scenarioCount + " scenario" + (scenarioCount != 1 ? "s" : "");
      if (scenarioCount > 0 ) {
        if (failedScenarioCount > 0)
          details.push(setColor(failedScenarioCount + " failed", PrettyFormatter.FAILED_STEP_COLOR));
        if (undefinedScenarioCount > 0)
          details.push(setColor(undefinedScenarioCount + " undefined", PrettyFormatter.UNDEFINED_STEP_COLOR));
        if (pendingScenarioCount > 0)
          details.push(setColor(pendingScenarioCount + " pending", PrettyFormatter.PENDING_STEP_COLOR));
        if (passedScenarioCount > 0)
          details.push(setColor(passedScenarioCount + " passed", PrettyFormatter.PASSED_STEP_COLOR));
        summary += " (" + details.join(', ') + ")";
      }
      self.log(summary + "\n");
    },

    logStepsSummary: function logStepsSummary() {
      var stepCount          = self.getStepCount();
      var passedStepCount    = self.getPassedStepCount();
      var undefinedStepCount = self.getUndefinedStepCount();
      var skippedStepCount   = self.getSkippedStepCount();
      var pendingStepCount   = self.getPendingStepCount();
      var failedStepCount    = self.getFailedStepCount();
      var details            = [];
      var summary;

      summary = stepCount + " step" + (stepCount != 1 ? "s" : "");
      if (stepCount > 0) {
        if (failedStepCount > 0)
          details.push(setColor(failedStepCount    + " failed", PrettyFormatter.FAILED_STEP_COLOR));
        if (undefinedStepCount > 0)
          details.push(setColor(undefinedStepCount + " undefined", PrettyFormatter.UNDEFINED_STEP_COLOR));
        if (pendingStepCount > 0)
          details.push(setColor(pendingStepCount   + " pending", PrettyFormatter.PENDING_STEP_COLOR));
        if (skippedStepCount > 0)
          details.push(setColor(skippedStepCount   + " skipped", PrettyFormatter.SKIPPED_STEP_COLOR));
        if (passedStepCount > 0)
          details.push(setColor(passedStepCount    + " passed", PrettyFormatter.PASSED_STEP_COLOR));
        summary += " (" + details.join(', ') + ")";
      }
      self.log(summary + "\n");
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
PrettyFormatter.PASSED_STEP_COLOR         = 'green';
PrettyFormatter.SKIPPED_STEP_COLOR        = 'blue';
PrettyFormatter.UNDEFINED_STEP_COLOR      = 'cyan';
PrettyFormatter.PENDING_STEP_COLOR        = 'yellow';
PrettyFormatter.FAILED_STEP_COLOR         = 'red';
PrettyFormatter.EVENT_HANDLER_NAME_PREFIX = 'handle';
PrettyFormatter.EVENT_HANDLER_NAME_SUFFIX = 'Event';

return PrettyFormatter;
});
