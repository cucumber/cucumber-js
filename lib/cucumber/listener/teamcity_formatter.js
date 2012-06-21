var TeamCityFormatter = function (options) {
  var Cucumber = require('../../cucumber');

  var self = Cucumber.Listener.Formatter(options);
  var summaryLogger = Cucumber.Listener.Summarizer();
  var failedScenarioLogBuffer = "";
  var ignoredScenarioLogBuffer = "";
  var currentScenarioFailing = false;
  var currentScenarioUndefined = false;
  var currentScenarioPending = false;

  var parentHear = self.hear;
  self.hear = function hear(event, callback) {
    summaryLogger.hear(event, function () {
      parentHear(event, callback);
    });
  };

  self.handleBeforeScenarioEvent = function handleBeforeScenarioEvent(event, callback) {
    self.prepareBeforeScenario();
    var scenario = event.getPayloadItem('scenario');
    self.logTeamCity("Started name='" + self.escapeMessageValue(scenario.getName()) + "' captureStandardOutput='true'");
    self.logScenario(scenario);
    callback();
  };

  self.handleStepResultEvent = function handleStepResult(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    var step = stepResult.getStep();
    self.logStepResult(stepResult, step);
    if (stepResult.isPending()) {
      self.appendStringToIgnoredScenarioLogBuffer(stepResult.getStep().getName() + " is pending");
      self.markCurrentScenarioAsPending();
    } else if (stepResult.isUndefined()) {
      self.appendStringToIgnoredScenarioLogBuffer(stepResult.getStep().getName() + " is undefined");
      self.markCurrentScenarioAsUndefined();
    } else if (stepResult.isFailed()){
      self.logFailedStepResult(stepResult);
      self.markCurrentScenarioAsFailing();
    }
    callback();
  };

  self.handleAfterFeatureEvent = function handleAfterFeatureEvent(event, callback) {
    var feature = event.getPayloadItem('feature');
    self.logTeamCity("SuiteFinished name='" + self.escapeMessageValue(feature.getName()) + "'");
    callback();
  };

  self.handleBeforeFeatureEvent = function handleBeforeFeatureEvent(event, callback) {
    var feature = event.getPayloadItem('feature');
    self.logTeamCity("SuiteStarted name='" + self.escapeMessageValue(feature.getName()) + "'");
    self.logFeature(feature);
    callback();
  };

  self.handleAfterScenarioEvent = function handleAfterScenarioEvent(event, callback) {
    var scenario = event.getPayloadItem('scenario');
    if (self.isCurrentScenarioPending() || self.isCurrentScenarioUndefined()) {
      self.logTeamCity("Ignored name='" + self.escapeMessageValue(scenario.getName()) +
        "' message='Scenario Ignored' details='" + self.escapeMessageValue(ignoredScenarioLogBuffer) + "'");
    } else if (self.isCurrentScenarioFailing()) {
      self.logTeamCity("Failed name='" + self.escapeMessageValue(scenario.getName()) +
        "' message='Scenario Failed' details='" + self.escapeMessageValue(failedScenarioLogBuffer) + "'");
    }
    self.logTeamCity("Finished name='" + self.escapeMessageValue(scenario.getName()) + "'");
    callback();
  };

  self.prepareBeforeScenario = function prepareBeforeScenario() {
    currentScenarioFailing = false;
    currentScenarioPending = false;
    currentScenarioUndefined = false;
    failedScenarioLogBuffer = "";
    ignoredScenarioLogBuffer = "";
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

  self.appendStringToFailedScenarioLogBuffer = function appendStringToFailedScenarioLogBuffer(string) {
    failedScenarioLogBuffer += string + "\n";
  };

  self.appendStringToIgnoredScenarioLogBuffer = function appendStringToIgnoreScenarioLogBuffer(string) {
    ignoredScenarioLogBuffer += string + "\n";
  };

  self.logFeature = function logFeature(feature) {
    var description = feature.getDescription().split("\n").map(function (l) {
      return "  " + l;
    }).join("\n");
    self.log(feature.getKeyword() + ": " + feature.getName() + "\n");
    self.log(description + "\n\n");
    if (feature.hasBackground()) {
      self.log(feature.getBackground().split("\n").map(function (l) {
        return "  " + l;
      }).join("\n") + "\n\n");
    }
  };

  self.logScenario = function logScenarios(scenario) {
    self.log("  " + scenario.getKeyword() + ": " + scenario.getName() + "\n");
  };

  self.logStepResult = function logStepResult(stepResult, step) {
    self.log("    " + step.getKeyword() + step.getName() + "\n");
  };

  self.logFailedStepResult = function logFailedStepResult(stepResult) {
    var failureException = stepResult.getFailureException();
    var failureMessage = (failureException.stack || failureException) + "\n";
    self.log(failureMessage);
    self.appendStringToFailedScenarioLogBuffer(failureMessage);
  };

  self.logTeamCity = function logTeamCity(string) {
    self.log(TeamCityFormatter.MESSAGE_PREFIX + string + "]\n");
  };

  self.escapeMessageValue = function escapeMessageValue(string) {
    return string
      .replace(/\|/g, "||")
      .replace(/\n/g, "|n")
      .replace(/\r/g, "|r")
      .replace(/\[/g, "|[")
      .replace(/\]/g, "|]")
      .replace(/\u0085/g, "|x")
      .replace(/\u2028/g, "|l")
      .replace(/\u2029/g, "|p")
      .replace(/'/g, "|'");
  };

  return self;
};
TeamCityFormatter.EVENT_HANDLER_NAME_PREFIX = 'handle';
TeamCityFormatter.EVENT_HANDLER_NAME_SUFFIX = 'Event';
TeamCityFormatter.MESSAGE_PREFIX = '##teamcity[test';
module.exports = TeamCityFormatter;
