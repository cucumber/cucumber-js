var World = function(callback) {
  this.touchedSteps    = [];
  this.featureSource   = "";
  this.stepDefinitions = "";
  this.runOutput       = "";
  this.runSucceeded    = false;
  World.mostRecentInstance = this;
  callback(this);
};

var proto = World.prototype;

proto.runFeature = function runFeature(callback) {
  var supportCode;
  var supportCodeSource = "supportCode = function() {\n  var Given = When = Then = this.defineStep;\n" +
    this.stepDefinitions + "};\n";
  var world = this;
  eval(supportCodeSource);
  this.runFeatureWithSupportCodeSource(supportCode, callback);
}

proto.runFeatureWithSupportCodeSource = function runFeatureWithSupportCodeSource(supportCode, callback) {
  var world     = this;
  var Cucumber  = require('../../lib/cucumber');
  var cucumber  = Cucumber(this.featureSource, supportCode);
  var formatter = Cucumber.Listener.ProgressFormatter({logToConsole: false});
  cucumber.attachListener(formatter);
  cucumber.start(function(succeeded) {
    world.runSucceeded = succeeded;
    world.runOutput    = formatter.getLogs();
    Cucumber.Debug.notice(world.runOutput, 'cucumber output', 5);
    callback();
  });
}

proto.touchStep = function touchStep(string) {
  this.touchedSteps.push(string);
}

proto.isStepTouched = function isStepTouched(pattern) {
  return (this.touchedSteps.indexOf(pattern) >= 0);
}

proto.assertPassedFeature = function assertPassedFeature() {
  this.assertNoPartialOutput("failed", this.runOutput);
  this.assertSuccess();
}

proto.assertPassedScenario = function assertPassedScenario() {
  this.assertPartialOutput("1 scenario (1 passed)", this.runOutput);
  this.assertSuccess();
}

proto.assertFailedScenario = function assertFailedScenario() {
  this.assertPartialOutput("1 scenario (1 failed)", this.runOutput);
  this.assertFailure();
}

proto.assertPendingScenario = function assertPendingScenario() {
  this.assertPartialOutput("1 scenario (1 pending)", this.runOutput);
  this.assertSuccess();
}

proto.assertUndefinedScenario = function assertUndefinedScenario() {
  this.assertPartialOutput("1 scenario (1 undefined)", this.runOutput);
  this.assertSuccess();
}

proto.assertScenarioReportedAsFailing = function assertScenarioReportedAsFailing(scenarioName) {
  this.assertPartialOutput("# Scenario: " + scenarioName, this.runOutput);
  this.assertFailure();
}

proto.assertScenarioNotReportedAsFailing = function assertScenarioNotReportedAsFailing(scenarioName) {
  this.assertNoPartialOutput("# Scenario: " + scenarioName, this.runOutput);
}

proto.assertPassedStep = function assertPassedStep(stepName) {
  if (!this.isStepTouched(stepName))
    throw(new Error("Expected step \"" + stepName + "\" to have passed."));
}

proto.assertSkippedStep = function assertSkippedStep(stepName) {
  if (this.isStepTouched(stepName))
    throw(new Error("Expected step \"" + stepName + "\" to have been skipped."));
}

proto.assertSuccess = function assertSuccess() {
  if (!this.runSucceeded)
    throw(new Error("Expected Cucumber to succeed but it failed."));
}

proto.assertFailure = function assertFailure() {
  if (this.runSucceeded)
    throw(new Error("Expected Cucumber to fail but it succeeded."));
}

proto.assertFailureMessage = function assertFailureMessage(message) {
  this.assertPartialOutput(message, this.runOutput);
  this.assertFailure();
}

proto.assertPartialOutput = function assertPartialOutput(expected, actual) {
  if (actual.indexOf(expected) < 0)
    throw(new Error("Expected:\n\"" + actual + "\"\nto match:\n\"" + expected + "\""));
}

proto.assertNoPartialOutput = function assertNoPartialOutput(expected, actual) {
  if (actual.indexOf(expected) >= 0)
    throw(new Error("Expected:\n\"" + actual + "\"\nnot to match:\n\"" + expected + "\""));
}

proto.assertEqual = function assertRawDataTable(expected, actual) {
  var expectedJSON = JSON.stringify(expected);
  var actualJSON   = JSON.stringify(actual);
  if (actualJSON != expectedJSON)
    throw(new Error("Expected:\n\"" + actualJSON + "\"\nto match:\n\"" + expectedJSON + "\""));
}

exports.World = World;
