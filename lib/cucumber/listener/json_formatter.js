var JsonFormatter = function(options) {
  var Cucumber = require('../../cucumber');

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

  var output = {"name": "",
              "id": ""} 

  var self = {

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
        JsonFormatter.EVENT_HANDLER_NAME_PREFIX +
        event.getName() +
        JsonFormatter.EVENT_HANDLER_NAME_SUFFIX;
      return handlerName;
    },

    getHandlerForEvent: function getHandlerForEvent(event) {
      var eventHandlerName = self.buildHandlerNameForEvent(event);
      return self[eventHandlerName];
    },

    handleBeforeFeatureEvent: function handleBeforeFeatureEvent(event, callback) {
      output["name"] = event.getPayloadItem('feature').getName();
      var description = event.getPayloadItem('feature').getDescription();
      if (description != "")
        output["description"] = description
      callback();
    },


    handleBeforeScenarioEvent: function handleBeforeScenarioEvent(event, callback) {

      self.prepareBeforeScenario(); // Can probably get rid of this

      var scenario = event.getPayloadItem('scenario');

      var scenarioOutput = {"name": scenario.getName()};

      if (!("elements" in output)) {
        output["elements"] = [];
      }

      output["elements"].push(scenarioOutput);

      callback();
    },

    handleStepResultEvent: function handleStepResult(event, callback) {
      var stepResult = event.getPayloadItem('stepResult');

      if (!("elements" in output)) {
        output["elements"] = []; //TODO: Make Dry
      }     

      if (!([output["elements"].length-1]["steps"])) {
        [output["elements"].length-1]["steps"] = [];
      }

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
      process.stdout.write(JSON.stringify(output, null, 2));
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

/*
    logUndefinedStepSnippets: function logUndefinedStepSnippets() {
      var undefinedStepLogBuffer = self.getUndefinedStepLogBuffer();
      self.log("\nYou can implement step definitions for undefined steps with these snippets:\n\n");
      self.log(undefinedStepLogBuffer);
    },
*/

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

// TODO: Factor out to make common to all handlers
JsonFormatter.EVENT_HANDLER_NAME_PREFIX = 'handle';
JsonFormatter.EVENT_HANDLER_NAME_SUFFIX = 'Event';

module.exports                              = JsonFormatter;
