var ProgressFormatter = function(options) {
  var Cucumber = require('../../cucumber');

  var beforeEachScenarioUserFunctions = Cucumber.Type.Collection();
  var logs                            = "";
  var passedScenarios                 = 0;
  var failedScenarios                 = 0;
  var passedSteps                     = 0;
  var failedSteps                     = 0;
  var skippedSteps                    = 0;
  var currentScenarioFailing          = false;

  if (!options)
    options = {};
  if (options['logToConsole'] == undefined)
    options['logToConsole'] = true;

  var self = {
    beforeEachScenarioDo: function beforeEachScenarioDo(userFunction) {
      beforeEachScenarioUserFunctions.add(userFunction);
    },

    log: function log(string) {
      logs += string;
      if (options['logToConsole'])
        process.stdout.write(string);
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

    handleStepResultEvent: function handleStepResultEvent(event, callback) {
      var stepResult = event.getPayloadItem('stepResult');
      if (stepResult.isSuccessful()) {
        self.witnessPassedStep();
        self.log(ProgressFormatter.PASSING_STEP_CHARACTER);
      } else {
        self.witnessFailedStep();
        self.markCurrentScenarioAsFailing();
        self.log(ProgressFormatter.FAILED_STEP_CHARACTER);
      }
      callback();
    },

    handleSkippedStepEvent: function(event, callback) {
      self.witnessSkippedStep();
      self.log(ProgressFormatter.SKIPPED_STEP_CHARACTER);
      callback();
    },

    handleAfterFeaturesEvent: function handleAfterFeaturesEvent(event, callback) {
      self.logSummary();
      callback();
    },

    handleAfterScenarioEvent: function handleAfterScenarioEvent(event, callback) {
      if (self.isCurrentScenarioFailing()) {
        self.witnessFailedScenario();
      } else {
        self.witnessPassedScenario();
      }
      callback();
    },

    prepareBeforeScenario: function prepareBeforeScenario() {
      currentScenarioFailing = false;
    },

    markCurrentScenarioAsFailing: function markCurrentScenarioAsFailing() {
      currentScenarioFailing = true;
    },

    isCurrentScenarioFailing: function isCurrentScenarioFailing() {
      return currentScenarioFailing;
    },

    logSummary: function logSummary() {
      self.log("\n\n");
      self.logScenariosSummary();
      self.logStepsSummary();
      self.log("\n");
    },

    logScenariosSummary: function logScenariosSummary() {
      var scenarioCount       = self.getScenarioCount();
      var passedScenarioCount = self.getPassedScenarioCount();
      var failedScenarioCount = self.getFailedScenarioCount();
      var details = [];

      self.log(scenarioCount + " scenario" + (scenarioCount != 1 ? "s" : ""));
      if (failedScenarioCount > 0)
        details.push(failedScenarioCount + " failed");
      if (passedScenarioCount > 0)
        details.push(passedScenarioCount + " passed");
      self.log(" (" + details.join(', ') + ")\n");
    },

    logStepsSummary: function logStepsSummary() {
      var stepCount        = self.getStepCount();
      var passedStepCount  = self.getPassedStepCount();
      var skippedStepCount = self.getSkippedStepCount();
      var failedStepCount  = self.getFailedStepCount();
      var details          = [];

      self.log(stepCount + " step" + (stepCount != 1 ? "s" : ""));
      if (failedStepCount > 0)
        details.push(failedStepCount + " failed");
      if (skippedStepCount > 0)
        details.push(skippedStepCount + " skipped");
      if (passedStepCount > 0)
        details.push(passedStepCount + " passed");
      self.log(" (" + details.join(', ') + ")\n");
    },

    witnessPassedScenario: function witnessPassedScenario() {
      passedScenarios++;
    },

    witnessFailedScenario: function witnessFailedScenario() {
      failedScenarios++;
    },

    witnessPassedStep: function witnessPassedStep() {
      passedSteps++;
    },

    witnessFailedStep: function witnessFailedStep() {
      failedSteps++;
    },

    witnessSkippedStep: function witnessSkippedStep() {
      skippedSteps++;
    },

    getScenarioCount: function getScenarioCount() {
      return self.getPassedScenarioCount() + self.getFailedScenarioCount();
    },

    getPassedScenarioCount: function getPassedScenarioCount() {
      return passedScenarios;
    },

    getFailedScenarioCount: function getFailedScenarioCount() {
      return failedScenarios;
    },

    getStepCount: function getStepCount() {
      return self.getPassedStepCount() + self.getSkippedStepCount() + self.getFailedStepCount();
    },

    getPassedStepCount: function getPassedStepCount() {
      return passedSteps;
    },

    getFailedStepCount: function getFailedStepCount() {
      return failedSteps;
    },

    getSkippedStepCount: function getSkippedStepCount() {
      return skippedSteps;
    }
  };
  return self;
};
ProgressFormatter.PASSING_STEP_CHARACTER    = '.';
ProgressFormatter.SKIPPED_STEP_CHARACTER     = '-';
ProgressFormatter.FAILED_STEP_CHARACTER     = 'F';
ProgressFormatter.EVENT_HANDLER_NAME_PREFIX = 'handle';
ProgressFormatter.EVENT_HANDLER_NAME_SUFFIX = 'Event';
module.exports                              = ProgressFormatter;
