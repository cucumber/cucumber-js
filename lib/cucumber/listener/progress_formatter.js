var ProgressFormatter = function(options) {
  var Cucumber = require('../../cucumber');

  var beforeEachScenarioUserFunctions = Cucumber.Types.Collection();
  var logs                            = "";
  var passedScenarios                 = 0;
  var passedSteps                     = 0;

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

    handleStepResultEvent: function handleStepResultEvent(event, callback) {
      var stepResult = event.getPayloadItem('stepResult');
      if (stepResult.isSuccessful()) {
        self.countOnePassedStep();
        self.log(ProgressFormatter.PASSING_STEP_CHARACTER);
      } else {
        self.countOneFailedStep();
        self.log(ProgressFormatter.FAILED_STEP_CHARACTER);
      }
      callback();
    },

    handleAfterFeaturesEvent: function handleAfterFeaturesEvent(event, callback) {
      self.logSummary();
      callback();
    },

    handleAfterScenarioEvent: function handleAfterScenarioEvent(event, callback) {
      self.countOnePassedScenario();
      callback();
    },

    countOnePassedScenario: function countOnePassedScenario() {
      passedScenarios++;
    },

    countOnePassedStep: function countOnePassedStep() {
      passedSteps++;
    },

    countOneFailedStep: Cucumber.Debug.TODO("countOneFailedStep()"),

    logSummary: function logSummary() {
      self.log("\n\n");
      var scenarioCount       = self.getScenarioCount();
      var passedScenarioCount = self.getPassedScenarioCount();
      var stepCount           = self.getStepCount();
      var passedStepCount     = self.getPassedStepCount();
      self.log(scenarioCount + " scenario(s) (" + passedScenarioCount + " passed)\n");
      self.log(stepCount + " step(s) (" + passedStepCount + " passed)");
      self.log("\n");
    },

    getScenarioCount: function getScenarioCount() {
      return self.getPassedScenarioCount();
    },

    getPassedScenarioCount: function getPassedScenarioCount(){
      return passedScenarios;
    },

    getStepCount: function getStepCount() {
      return self.getPassedStepCount();
    },

    getPassedStepCount: function getPassedStepCount() {
      return passedSteps;
    }
  };
  return self;
};
ProgressFormatter.PASSING_STEP_CHARACTER    = '.';
ProgressFormatter.FAILED_STEP_CHARACTER    = 'F';
ProgressFormatter.EVENT_HANDLER_NAME_PREFIX = 'handle';
ProgressFormatter.EVENT_HANDLER_NAME_SUFFIX = 'Event';

module.exports = ProgressFormatter;
